/**
 * Power-Ups Sidecar — Custom sGTM Tracking Proxy (Node.js)
 *
 * UPGRADE v2.1:
 *  - Multi-tenancy support via host-based mappings (/etc/sgtm/mappings.json)
 *  - Hybrid Ingestion: Direct ClickHouse or Kafka-Buffered Stream
 *  - X-Request-ID tracing and safe PII sanitization
 */

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@clickhouse/client');
const { Kafka, Partitioners } = require('kafkajs');
const xml2js = require('xml2js');

// ── Config ──────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '8081', 10);
const CONTAINER_ID = process.env.CONTAINER_ID || 'unknown';
const API_SECRET = process.env.API_SECRET || '';
const POWERUPS_URL = process.env.POWERUPS_URL || 'http://localhost:8000/api/tracking';
const SGTM_UPSTREAM = process.env.SGTM_UPSTREAM || 'http://localhost:8080';
const COOKIE_NAME = process.env.COOKIE_NAME || '_fp_id';
const COOKIE_MAX_AGE = parseInt(process.env.COOKIE_MAX_AGE || '31536000', 10);
const DEBUG_AUTH = process.env.DEBUG_AUTH || '';
const CUSTOM_SCRIPT = process.env.CUSTOM_SCRIPT || '';
const CLICK_ID_RESTORE = process.env.CLICK_ID_RESTORE === 'true';
const LOADER_PATH = process.env.LOADER_PATH || '';

// Phase 2 Advanced Features
const XML_TO_JSON = process.env.XML_TO_JSON === 'true';
const FILE_PROXY = process.env.FILE_PROXY === 'true';
const SCHEDULE_REQUESTS = process.env.SCHEDULE_REQUESTS === 'true';
const POAS_DATA_FEED = process.env.POAS_DATA_FEED === 'true';
const AD_BLOCKER_INFO = process.env.AD_BLOCKER_INFO === 'true';

// ClickHouse Config
const CH_TYPE = process.env.CLICKHOUSE_TYPE || 'self_hosted';
const CH_HOST = process.env.CLICKHOUSE_HOST || 'localhost';
const CH_PORT = process.env.CLICKHOUSE_PORT || '8123';
const CH_USER = process.env.CLICKHOUSE_USER || 'default';
const CH_PASS = process.env.CLICKHOUSE_PASSWORD || '';
const CH_DB = process.env.CLICKHOUSE_DB || 'sgtm_tracking';

// Initialize ClickHouse Client
let chClient = null;
if (CH_HOST) {
    chClient = createClient({
        url: CH_HOST.startsWith('http') ? CH_HOST : `${CH_PORT === '8443' ? 'https' : 'http'}://${CH_HOST}:${CH_PORT}`,
        username: CH_USER,
        password: CH_PASS,
        database: CH_DB,
    });
}

// ── Multi-tenancy Mapping ──────────────────────────────────────────────────
let tenantMappings = {};
const MAPPINGS_PATH = '/etc/sgtm/mappings.json';

function loadTenantMappings() {
    try {
        if (fs.existsSync(MAPPINGS_PATH)) {
            const data = fs.readFileSync(MAPPINGS_PATH, 'utf8');
            tenantMappings = JSON.parse(data, (key, value) => {
                return key === 'tenant_id' ? parseInt(value, 10) : value;
            });
            console.log(`[sidecar] Loaded ${Object.keys(tenantMappings).length} tenant mappings.`);
        }
    } catch (err) {
        console.error(`[sidecar] Failed to load mappings: ${err.message}`);
    }
}

// Initial load
loadTenantMappings();

// Watch directory for changes (more robust than watching a missing file)
const MAPPINGS_DIR = path.dirname(MAPPINGS_PATH);
if (fs.existsSync(MAPPINGS_DIR)) {
    fs.watch(MAPPINGS_DIR, (eventType, filename) => {
        if (filename === 'mappings.json') {
            console.log('[sidecar] Mappings updated. Reloading...');
            loadTenantMappings();
        }
    });
}

function resolveTenant(req) {
    const host = (req.headers.host || '').split(':')[0];
    if (tenantMappings[host]) {
        return {
            ...tenantMappings[host],
            secret_key: tenantMappings[host].secret_key || API_SECRET
        };
    }
    return {
        tenant_id: parseInt(String(process.env.TENANT_ID || '0'), 10),
        container_id: String(process.env.CONTAINER_ID || CONTAINER_ID),
        secret_key: API_SECRET
    };
}

// ── Ingestion Pipeline Strategy ──────────────────────────────────────────────
const INGESTION_MODE = process.env.INGESTION_MODE || 'direct';
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const KAFKA_TOPIC = process.env.KAFKA_TOPIC || 'tracking-events';

let kafkaProducer = null;
if (INGESTION_MODE === 'kafka' && KAFKA_BROKERS.length > 0) {
    const kafka = new Kafka({ clientId: CONTAINER_ID, brokers: KAFKA_BROKERS });
    kafkaProducer = kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner });
    kafkaProducer.connect().catch(err => console.error(`[sidecar] Kafka failed: ${err.message}`));
}

// Config Constants
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 250;
const API_TIMEOUT_MS = 5000;

// ── Metrics ─────────────────────────────────────────────────────────────────
const metrics = {
    requests: 0, errors: 0, forwarded: 0, dropped: 0, startedAt: new Date().toISOString()
};

// ── Debug SSE ────────────────────────────────────────────────────────────────
const debugClients = new Set();
const eventBuffer = [];
const MAX_BUFFER = 200;

function pushToDebug(eventData) {
    const safe = sanitizeForDebug(eventData);
    eventBuffer.unshift(safe);
    if (eventBuffer.length > MAX_BUFFER) eventBuffer.pop();
    const data = JSON.stringify(safe);
    for (const client of debugClients) {
        try { client.write(`data: ${data}\n\n`); } catch { debugClients.delete(client); }
    }
}

function sanitizeForDebug(evt) {
    const copy = { ...evt };
    if (copy.user_data) {
        const ud = { ...copy.user_data };
        if (ud.email) ud.email = ud.email.substring(0, 3) + '***@' + (ud.email.split('@')[1] || '?');
        if (ud.phone) ud.phone = '***' + String(ud.phone).slice(-4);
        copy.user_data = ud;
    }
    return copy;
}

// ── Server ───────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
    metrics.requests++;
    const requestId = req.headers['x-request-id'] || uuidv4();
    req._requestId = requestId;
    res.setHeader('X-Request-ID', requestId);

    const parsed = url.parse(req.url, true);
    if (req.method === 'OPTIONS') {
        setCorsHeaders(res);
        res.writeHead(204);
        return res.end();
    }
    setCorsHeaders(res);

    if (CLICK_ID_RESTORE) restoreClickIds(req, parsed);

    switch (parsed.pathname) {
        case '/healthz': return respondJson(res, 200, { status: 'ok', container: CONTAINER_ID });
        case '/collect':
        case '/g/collect': return handleCollect(req, res, parsed);
        case '/gtag/js': return handleGtmJs(req, res, parsed);
        case '/proxy/script': return handleFileProxy(req, res, parsed);
        case '/feed/poas': return handlePoasFeed(req, res, parsed);
        case '/debug': return handleDebugUI(req, res, parsed);
        case '/debug/stream': return handleDebugStream(req, res, parsed);
        case '/debug/recent': return respondJson(res, 200, { events: eventBuffer.slice(0, 50) });
        default:
            if (LOADER_PATH && parsed.pathname === LOADER_PATH) return handleCustomLoader(req, res, parsed);
            if (req.method === 'POST') return handleCollect(req, res, parsed);
            return respondJson(res, 404, { error: 'Not found' });
    }
});

// ── Handlers ──────────────────────────────────────────────────────────────────
async function handleCollect(req, res, parsed) {
    const requestId = req._requestId;
    const metadata = resolveTenant(req);
    const tenantId = metadata.tenant_id;
    const containerId = metadata.container_id;

    try {
        const body = await readBody(req);
        let eventData = {};
        
        const contentType = req.headers['content-type'] || '';
        if (XML_TO_JSON && (contentType.includes('text/xml') || contentType.includes('application/xml'))) {
            try {
                const parser = new xml2js.Parser({ explicitArray: false });
                eventData = await parser.parseStringPromise(body);
            } catch { eventData = parsed.query || {}; }
        } else {
            try { eventData = body ? JSON.parse(body) : {}; } catch { eventData = parsed.query || {}; }
        }

        const cookies = parseCookies(req);
        const clientId = cookies[COOKIE_NAME] || eventData.client_id || uuidv4();
        const fbp = cookies['_fbp'] || null;
        const fbc = cookies['_fbc'] || eventData.fbc || null;

        const forwarded = req.headers['x-forwarded-for'];
        const sourceIp = req.headers['cf-connecting-ip'] || (forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress);

        const payload = {
            event_name: eventData.event_name || eventData.en || 'page_view',
            event_id: eventData.event_id || uuidv4(),
            client_id: clientId,
            container_id: containerId,
            request_id: requestId,
            timestamp: new Date().toISOString(),
            source_ip: sourceIp,
            user_agent: req.headers['user-agent'] || '',
            referrer: req.headers['referer'] || '',
            page_url: eventData.page_url || eventData.dl || '',
            user_data: eventData.user_data || {},
            custom_data: eventData.custom_data || eventData.ep || {},
            _fbp: fbp, _fbc: fbc, _raw: eventData
        };

        const transformed = transformEvent(payload);

        // Data Ingestion
        if (INGESTION_MODE === 'kafka' && kafkaProducer) {
            logToKafka(transformed, requestId, metadata).catch(e => console.error(`[Kafka Error]`, e.message));
        } else if (chClient) {
            logToClickHouse(transformed, requestId, metadata).catch(e => console.error(`[ClickHouse Error]`, e.message));
        }

        if (SCHEDULE_REQUESTS) {
            // Buffer/delay request forwarding to stagger tracking limits
            await sleep(1000 + Math.random() * 2000);
        }

        const powerUpResult = await forwardToPowerUpsWithRetry(transformed, requestId, containerId, metadata.secret_key);

        pushToDebug({ ...transformed, _status: powerUpResult?.success === false ? 'error' : 'success' });

        res.setHeader('Set-Cookie', `${COOKIE_NAME}=${clientId}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax; Secure; HttpOnly`);
        metrics.forwarded++;

        if (req.method === 'GET') return respondPixel(res);
        return respondJson(res, 200, { status: 'ok', event_id: payload.event_id, request_id: requestId });

    } catch (err) {
        metrics.errors++;
        return respondJson(res, 500, { error: 'Processing failed', request_id: requestId });
    }
}

async function forwardToPowerUpsWithRetry(payload, requestId, containerId, secret, attempt = 0) {
    const targetUrl = `${POWERUPS_URL}/proxy/${containerId}`;
    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Container-Secret': secret || API_SECRET, 'X-Request-ID': requestId },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(API_TIMEOUT_MS),
        });
        if (!response.ok && attempt < MAX_RETRIES) {
            await sleep(RETRY_DELAY_MS * (attempt + 1));
            return forwardToPowerUpsWithRetry(payload, requestId, containerId, secret, attempt + 1);
        }
        return await response.json();
    } catch (err) {
        if (attempt < MAX_RETRIES) {
            await sleep(RETRY_DELAY_MS * (attempt + 1));
            return forwardToPowerUpsWithRetry(payload, requestId, containerId, secret, attempt + 1);
        }
        return { status: 'error', message: err.message };
    }
}

async function logToClickHouse(evt, requestId, metadata) {
    if (!chClient) return;
    const row = {
        tenant_id: metadata.tenant_id,
        container_id: metadata.container_id,
        event_id: String(evt.event_id || uuidv4()),
        event_name: String(evt.event_name || 'unknown').substring(0, 100),
        source_ip: evt.source_ip || '',
        user_hash: evt.client_id || '',
        value: typeof evt.custom_data?.value === 'number' ? evt.custom_data.value : null,
        currency: evt.custom_data?.currency || 'USD',
        request_id: requestId,
        payload: JSON.stringify(evt),
        status: 'received',
        processed_at: new Date().toISOString().replace('T', ' ').replace(/\..+/, ''),
    };
    await chClient.insert({ table: 'sgtm_events', values: [row], format: 'JSONEachRow' });
}

async function logToKafka(evt, requestId, metadata) {
    if (!kafkaProducer) return;
    const payload = {
        tenant_id: metadata.tenant_id,
        container_id: metadata.container_id,
        event_id: String(evt.event_id || uuidv4()),
        event_name: String(evt.event_name || 'unknown'),
        request_id: requestId,
        payload: evt,
        processed_at: new Date().toISOString(),
    };
    await kafkaProducer.send({
        topic: KAFKA_TOPIC,
        messages: [{ key: String(metadata.container_id), value: JSON.stringify(payload) }],
    });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function readBody(req) {
    return new Promise((res, rej) => {
        let d = '';
        req.on('data', c => d += c);
        req.on('end', () => res(d));
        req.on('error', rej);
    });
}

function parseCookies(req) {
    const c = {};
    (req.headers.cookie || '').split(';').forEach(p => {
        const [k, ...v] = p.trim().split('=');
        if (k) c[k] = v.join('=');
    });
    return c;
}

function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Container-Secret, X-Request-ID');
}

function respondJson(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

function respondPixel(res) {
    const p = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAEALAAAAAABAAEAAAIBTAA7', 'base64');
    res.writeHead(200, { 'Content-Type': 'image/gif', 'Content-Length': p.length });
    res.end(p);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function transformEvent(payload) {
    let finalPayload = payload;
    
    // Ad Blocker Diagnostic Injection
    if (AD_BLOCKER_INFO) {
        if (!payload.referrer || (payload.page_url && payload.page_url.includes('ad_blocker=true'))) {
            finalPayload._ad_blocker_active = true;
        }
    }

    if (!CUSTOM_SCRIPT) return finalPayload;
    try {
        const sandbox = { event: JSON.parse(JSON.stringify(finalPayload)), JSON, Math, Date };
        const script = new vm.Script(`(function(){try{${CUSTOM_SCRIPT}return event;}catch(e){return{...event,_script_error:e.message};}})()`);
        return script.runInNewContext(sandbox, { timeout: 50 }) || finalPayload;
    } catch (e) { return { ...finalPayload, _script_error: e.message }; }
}

async function handleGtmJs(req, res, parsed) {
    const gtmId = parsed.query.id || CONTAINER_ID;
    const src = parsed.pathname.includes('gtag') ? `https://www.googletagmanager.com/gtag/js?id=${gtmId}` : `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    try {
        const r = await fetch(src);
        let s = await r.text();
        s = s.replace(/https:\/\/www\.google-analytics\.com\/g\/collect/g, '/g/collect');
        res.writeHead(200, { 'Content-Type': 'application/javascript', 'Cache-Control': 'public, max-age=3600' });
        res.end(s);
    } catch { res.writeHead(502); res.end('// GTM error'); }
}

async function handleCustomLoader(req, res, parsed) {
    const gtmId = parsed.query.id || CONTAINER_ID;
    const src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    try {
        const r = await fetch(src);
        let s = await r.text();
        s = s.replace(/https:\/\/www\.google-analytics\.com/g, '');
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(s);
    } catch { res.writeHead(502); res.end('// Error'); }
}

function handleDebugStream(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
    debugClients.add(res);
    req.on('close', () => debugClients.delete(res));
}

async function handleFileProxy(req, res, parsed) {
    if (!FILE_PROXY) return respondJson(res, 403, { error: 'File Proxy Power-Up disabled for this tenant.' });
    const targetUrl = parsed.query.url;
    if (!targetUrl) return respondJson(res, 400, { error: 'Missing ul parameter to proxy.' });
    try {
        const fetchRes = await fetch(targetUrl, {
            headers: { 'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        if (!fetchRes.ok) throw new Error('Fetch failed');
        const ct = fetchRes.headers.get('content-type') || 'application/javascript';
        res.writeHead(200, { 'Content-Type': ct, 'Cache-Control': 'public, max-age=3600' });
        const buf = await fetchRes.arrayBuffer();
        res.end(Buffer.from(buf));
    } catch (err) { res.writeHead(502); res.end('// Failed to proxy file'); }
}

async function handlePoasFeed(req, res, parsed) {
    if (!POAS_DATA_FEED) return respondJson(res, 403, { error: 'POAS Data Feed disabled.' });
    const metadata = resolveTenant(req);
    try {
        const fetchRes = await fetch(`${POWERUPS_URL}/feed/poas/${metadata.container_id}`, {
            headers: { 'X-Container-Secret': metadata.secret_key || API_SECRET }
        });
        res.writeHead(fetchRes.status, { 'Content-Type': fetchRes.headers.get('content-type') || 'application/json' });
        const buf = await fetchRes.arrayBuffer();
        res.end(Buffer.from(buf));
    } catch (err) { respondJson(res, 502, { error: 'POAS fetch failed' }); }
}

function handleDebugUI(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Sidecar Debug UI</h1>');
}

function restoreClickIds(req, parsed) { /* Placeholder */ }

server.listen(PORT, () => console.log(`[sidecar] Listening on ${PORT}`));
