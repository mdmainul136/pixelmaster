/**
 * PixelMaster JS SDK — Build Script
 * Bundles and minifies all SDK source files into a single dist/pixelmaster.min.js
 *
 * Usage: node build.js
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const DIST_DIR = path.join(__dirname, 'dist');

// Source files in dependency order
const FILES = ['utils.js', 'engagement.js', 'custom-events.js', 'ab-testing.js', 'consent.js', 'ecommerce.js', 'pixelmaster.js'];

function build() {
    console.log('🔨 Building PixelMaster JS SDK...\n');

    if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR, { recursive: true });
    }

    let combined = `/**
 * PixelMaster JS SDK v1.0.0
 * (c) ${new Date().getFullYear()} PixelMaster — Server-Side Tracking
 * License: MIT
 * Built: ${new Date().toISOString()}
 */
(function(window, document) {
'use strict';
`;

    // Inline all modules — convert ES modules to IIFE
    for (const file of FILES) {
        const filePath = path.join(SRC_DIR, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Remove import/export statements (we're bundling into IIFE)
        content = content.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '');
        content = content.replace(/^export\s+(default\s+)?/gm, '');
        content = content.replace(/^export\s*\{.*?\};?\s*$/gm, '');

        combined += `\n// ── ${file} ──\n`;
        combined += content + '\n';

        console.log(`  ✅ ${file} (${content.length} bytes)`);
    }

    // Close IIFE
    combined += `
// ── Global Registration ──
if (typeof window !== 'undefined') {
    window.PixelMaster = PixelMaster;
}

})(window, document);
`;

    // Write unminified version
    const fullPath = path.join(DIST_DIR, 'pixelmaster.js');
    fs.writeFileSync(fullPath, combined);
    console.log(`\n  📦 dist/pixelmaster.js (${combined.length} bytes)`);

    // Basic minification (remove comments, extra whitespace)
    let minified = combined;
    // Remove multi-line comments (but keep the header)
    const headerEnd = combined.indexOf('*/') + 2;
    const header = combined.substring(0, headerEnd);
    let body = combined.substring(headerEnd);

    body = body
        .replace(/\/\*[\s\S]*?\*\//g, '')        // Remove block comments
        .replace(/\/\/[^\n]*/g, '')                // Remove line comments
        .replace(/\n\s*\n/g, '\n')                 // Remove empty lines
        .replace(/^\s+/gm, '')                     // Remove leading whitespace
        .replace(/\s+$/gm, '')                     // Remove trailing whitespace
        .replace(/\n{2,}/g, '\n');                  // Collapse multiple newlines

    minified = header + '\n' + body;

    const minPath = path.join(DIST_DIR, 'pixelmaster.min.js');
    fs.writeFileSync(minPath, minified);
    console.log(`  📦 dist/pixelmaster.min.js (${minified.length} bytes)`);

    // Generate source map placeholder
    const mapPath = path.join(DIST_DIR, 'pixelmaster.min.js.map');
    fs.writeFileSync(mapPath, JSON.stringify({
        version: 3,
        file: 'pixelmaster.min.js',
        sources: FILES.map(f => `../src/${f}`),
        mappings: '',
    }));

    console.log(`\n✅ Build complete!\n`);
    console.log(`  Full:     ${fullPath}`);
    console.log(`  Minified: ${minPath}`);
    console.log(`  Map:      ${mapPath}\n`);
}

build();
