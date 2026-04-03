/* PixelMaster sGTM — Secure WordPress Admin JS */
(function($) {
    'use strict';

    if (typeof pmSgtmAdmin === 'undefined') {
        return;
    }

    $(document).ready(function() {
        var i18n = pmSgtmAdmin.i18n || {};

        // ── Connection Test ──
        $('#pm-test-connection').on('click', function() {
            var btn = $(this);
            var url = $('#pm_sgtm_transport_url').val();
            if (!url) { alert(i18n.enterUrl || 'Enter a Transport URL first'); return; }
            btn.prop('disabled', true).text(i18n.testing || 'Testing...');

            $.ajax({
                url: pmSgtmAdmin.ajaxUrl,
                method: 'POST',
                data: { action: 'pm_sgtm_test_connection', nonce: pmSgtmAdmin.nonce, url: url },
                timeout: 10000,
                success: function(res) {
                    btn.text(res.success ? '✅ Connected!' : '❌ ' + (res.data && res.data.message || 'Failed'));
                    resetBtn(btn, 3000);
                },
                error: function() { btn.text('❌ Failed'); resetBtn(btn, 3000); }
            });
        });

        // ── Password Field Toggle (all eye buttons) ──
        $(document).on('click', '.pm-sgtm-api-toggle', function() {
            var field = $(this).closest('.pm-field-row').find('input[type="password"], input[type="text"]').first();
            var isPassword = field.attr('type') === 'password';
            field.attr('type', isPassword ? 'text' : 'password');
        });

        // ── Health Refresh ──
        $('#pm-refresh-health').on('click', function() {
            var btn = $(this);
            btn.prop('disabled', true).text('Loading...');

            $.ajax({
                url: pmSgtmAdmin.ajaxUrl,
                method: 'POST',
                data: { action: 'pm_sgtm_health', nonce: pmSgtmAdmin.nonce },
                timeout: 15000,
                success: function(res) {
                    if (res.success) {
                        var d = res.data;
                        var statusEl = $('#pm-health-status');
                        statusEl.text(d.status === 'ok' ? '● OK' : '● Error')
                            .removeClass('pm-health-value--ok pm-health-value--err')
                            .addClass(d.status === 'ok' ? 'pm-health-value--ok' : 'pm-health-value--err');
                        $('#pm-health-latency').text(d.latency_ms + 'ms');
                        $('#pm-health-events').text(d.events_today !== undefined ? d.events_today : '—');
                        $('#pm-health-errors').text(d.errors_24h !== undefined ? d.errors_24h : '—');
                    } else {
                        $('#pm-health-status').text('Error').addClass('pm-health-value--err');
                    }
                    btn.prop('disabled', false).text('Refresh');
                },
                error: function() {
                    $('#pm-health-status').text('Offline').addClass('pm-health-value--err');
                    btn.prop('disabled', false).text('Refresh');
                }
            });

            // Also fetch event logs
            $.ajax({
                url: pmSgtmAdmin.ajaxUrl,
                method: 'POST',
                data: { action: 'pm_sgtm_event_logs', nonce: pmSgtmAdmin.nonce },
                timeout: 15000,
                success: function(res) {
                    var tbody = $('#pm-event-tbody');
                    tbody.empty();
                    if (res.success && res.data && res.data.length) {
                        $.each(res.data, function(i, log) {
                            var statusDot = log.status === 'ok'
                                ? '<span class="pm-status-dot pm-status-dot--ok"></span>'
                                : '<span class="pm-status-dot pm-status-dot--err"></span>';
                            var time = new Date(log.created_at).toLocaleTimeString();
                            tbody.append(
                                '<tr><td>' + $('<span>').text(log.event_type).html() + '</td>' +
                                '<td>' + $('<span>').text(log.source || '—').html() + '</td>' +
                                '<td>' + statusDot + log.status + '</td>' +
                                '<td>' + time + '</td></tr>'
                            );
                        });
                    } else {
                        tbody.html('<tr><td colspan="4" style="text-align:center;color:#8c9196;">No events yet</td></tr>');
                    }
                }
            });
        });

        // ── Export Settings ──
        $('#pm-export-btn').on('click', function() {
            $.ajax({
                url: pmSgtmAdmin.ajaxUrl,
                method: 'POST',
                data: { action: 'pm_sgtm_export', nonce: pmSgtmAdmin.nonce },
                success: function(res) {
                    if (res.success) {
                        var blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
                        var url = URL.createObjectURL(blob);
                        var a = document.createElement('a');
                        a.href = url;
                        a.download = 'pixelmaster-settings-' + new Date().toISOString().slice(0,10) + '.json';
                        a.click();
                        URL.revokeObjectURL(url);
                    } else {
                        alert('Export failed');
                    }
                }
            });
        });

        // ── Import Settings ──
        $('#pm-import-btn').on('click', function() {
            $('#pm-import-file').trigger('click');
        });
        $('#pm-import-file').on('change', function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(ev) {
                if (!confirm('This will overwrite your current settings. Continue?')) return;
                $.ajax({
                    url: pmSgtmAdmin.ajaxUrl,
                    method: 'POST',
                    data: { action: 'pm_sgtm_import', nonce: pmSgtmAdmin.nonce, settings: ev.target.result },
                    success: function(res) {
                        if (res.success) {
                            alert(res.data.message || 'Settings imported!');
                            location.reload();
                        } else {
                            alert('Import failed: ' + (res.data && res.data.message || ''));
                        }
                    }
                });
            };
            reader.readAsText(file);
        });

        // ── Snippet Generator ──
        $('#pm-snippet-btn').on('click', function() {
            var btn = $(this);
            btn.prop('disabled', true).text('Generating...');
            $.ajax({
                url: pmSgtmAdmin.ajaxUrl,
                method: 'POST',
                data: { action: 'pm_sgtm_snippet', nonce: pmSgtmAdmin.nonce },
                success: function(res) {
                    if (res.success) {
                        $('#pm-snippet-output').show().find('textarea').val(res.data.snippet);
                    } else {
                        alert(res.data && res.data.message || 'Configure Transport URL first');
                    }
                    btn.prop('disabled', false).text('Generate');
                }
            });
        });
        $('#pm-snippet-copy').on('click', function() {
            var ta = $('#pm-snippet-output textarea')[0];
            ta.select();
            document.execCommand('copy');
            $(this).text('Copied!');
            setTimeout(function() { $('#pm-snippet-copy').text('Copy to clipboard'); }, 2000);
        });

        // ── UTM Builder ──
        $('#pm-utm-generate').on('click', function() {
            var url = $('#pm-utm-url').val().trim();
            var source = $('#pm-utm-source').val().trim();
            var medium = $('#pm-utm-medium').val().trim();
            var campaign = $('#pm-utm-campaign').val().trim();
            var term = $('#pm-utm-term').val().trim();
            var content = $('#pm-utm-content').val().trim();

            // Validation
            if (!url) { alert('Please enter a Website URL'); $('#pm-utm-url').focus(); return; }
            if (!source) { alert('Please enter a Campaign Source'); $('#pm-utm-source').focus(); return; }
            if (!medium) { alert('Please enter a Campaign Medium'); $('#pm-utm-medium').focus(); return; }
            if (!campaign) { alert('Please enter a Campaign Name'); $('#pm-utm-campaign').focus(); return; }

            // Ensure URL has protocol
            if (!/^https?:\/\//i.test(url)) { url = 'https://' + url; }

            // Build params
            var params = [];
            params.push('utm_source=' + encodeURIComponent(source));
            params.push('utm_medium=' + encodeURIComponent(medium));
            params.push('utm_campaign=' + encodeURIComponent(campaign));
            if (term) params.push('utm_term=' + encodeURIComponent(term));
            if (content) params.push('utm_content=' + encodeURIComponent(content));

            // Append to URL
            var separator = url.indexOf('?') !== -1 ? '&' : '?';
            var result = url + separator + params.join('&');

            $('#pm-utm-result').val(result);
            $('#pm-utm-output').slideDown(200);
        });

        // UTM copy
        $('#pm-utm-copy').on('click', function() {
            pmCopyField('#pm-utm-result', $(this));
        });
        $('#pm-utm-short-copy').on('click', function() {
            pmCopyField('#pm-utm-short-result', $(this));
        });

        function pmCopyField(selector, btn) {
            var el = $(selector)[0];
            el.select();
            document.execCommand('copy');
            var origText = btn.text();
            btn.text('Copied!');
            setTimeout(function() { btn.text(origText); }, 2000);
        }

        // UTM clear
        $('#pm-utm-clear').on('click', function() {
            $('#pm-utm-url, #pm-utm-source, #pm-utm-medium, #pm-utm-campaign, #pm-utm-term, #pm-utm-content').val('');
            $('#pm-utm-output').slideUp(200);
            $('#pm-utm-url').focus();
        });

        // ═══ Custom Events Builder ═══
        var ceList = $('#pm-custom-events-list');

        function ceRow(evt) {
            evt = evt || {id:'',event_name:'',selector:'',trigger:'click',active:true};
            var id = evt.id || 'ce_' + Date.now();
            return '<div class="pm-ce-row" data-id="'+id+'" style="padding:12px;background:#f9fafb;border:1px solid #e1e3e5;border-radius:8px;margin-bottom:8px;">' +
                '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
                '<input type="text" class="pm-input pm-ce-name" value="'+esc(evt.event_name)+'" placeholder="Event name (e.g. cta_click)" style="flex:1;min-width:140px;" />' +
                '<input type="text" class="pm-input pm-ce-selector" value="'+esc(evt.selector)+'" placeholder="CSS selector (e.g. .btn-cta)" style="flex:1;min-width:140px;" />' +
                '<select class="pm-select pm-ce-trigger" style="width:100px;">' +
                '<option value="click"'+(evt.trigger==='click'?' selected':'')+'>Click</option>' +
                '<option value="submit"'+(evt.trigger==='submit'?' selected':'')+'>Submit</option>' +
                '<option value="visible"'+(evt.trigger==='visible'?' selected':'')+'>Visible</option>' +
                '<option value="hover"'+(evt.trigger==='hover'?' selected':'')+'>Hover</option>' +
                '</select>' +
                '<label style="font-size:12px;white-space:nowrap;"><input type="checkbox" class="pm-ce-active"'+(evt.active?' checked':'')+' /> Active</label>' +
                '<button type="button" class="pm-btn pm-btn--secondary pm-btn--sm pm-ce-remove" style="color:#d72c0d;">✕</button>' +
                '</div></div>';
        }

        function esc(s) { return $('<span>').text(s||'').html(); }

        // Load existing
        $.ajax({
            url: pmSgtmAdmin.ajaxUrl, method: 'POST',
            data: {action:'pm_sgtm_get_custom_events',nonce:pmSgtmAdmin.nonce},
            success: function(r) {
                if(r.success && r.data && r.data.length) {
                    r.data.forEach(function(e) { ceList.append(ceRow(e)); });
                }
            }
        });

        $('#pm-ce-add').on('click', function() { ceList.append(ceRow()); });
        ceList.on('click', '.pm-ce-remove', function() { $(this).closest('.pm-ce-row').remove(); });

        $('#pm-ce-save').on('click', function() {
            var btn = $(this);
            var events = [];
            ceList.find('.pm-ce-row').each(function() {
                var $r = $(this);
                events.push({
                    id: $r.data('id'),
                    event_name: $r.find('.pm-ce-name').val().trim(),
                    selector: $r.find('.pm-ce-selector').val().trim(),
                    trigger: $r.find('.pm-ce-trigger').val(),
                    active: $r.find('.pm-ce-active').is(':checked')
                });
            });
            btn.prop('disabled', true).text('Saving...');
            $.ajax({
                url: pmSgtmAdmin.ajaxUrl, method: 'POST',
                data: {action:'pm_sgtm_save_custom_events',nonce:pmSgtmAdmin.nonce,events:JSON.stringify(events)},
                success: function(r) {
                    btn.prop('disabled', false).text(r.success ? '✓ Saved!' : 'Error');
                    setTimeout(function() { btn.text('Save events'); }, 2000);
                }
            });
        });

        // ═══ A/B Tests Builder ═══
        var abList = $('#pm-ab-tests-list');

        function abRow(test) {
            test = test || {id:'',name:'',active:true,variants:[{id:'control',name:'Control',weight:50},{id:'variant_b',name:'Variant B',weight:50}]};
            var id = test.id || 'ab_' + Date.now();
            var html = '<div class="pm-ab-row" data-id="'+id+'" style="padding:12px;background:#f9fafb;border:1px solid #e1e3e5;border-radius:8px;margin-bottom:8px;">' +
                '<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">' +
                '<input type="text" class="pm-input pm-ab-name" value="'+esc(test.name)+'" placeholder="Test name (e.g. hero_banner_test)" style="flex:1;" />' +
                '<label style="font-size:12px;white-space:nowrap;"><input type="checkbox" class="pm-ab-active"'+(test.active?' checked':'')+' /> Active</label>' +
                '<button type="button" class="pm-btn pm-btn--secondary pm-btn--sm pm-ab-remove" style="color:#d72c0d;">✕</button>' +
                '</div>' +
                '<div class="pm-ab-variants" style="margin-left:12px;">';
            (test.variants||[]).forEach(function(v) {
                html += abVariantRow(v);
            });
            html += '</div>' +
                '<button type="button" class="pm-btn pm-btn--secondary pm-btn--sm pm-ab-add-variant" style="margin-top:4px;margin-left:12px;font-size:11px;">+ Variant</button>' +
                '</div>';
            return html;
        }

        function abVariantRow(v) {
            v = v || {id:'',name:'',weight:50};
            return '<div class="pm-ab-variant" style="display:flex;gap:6px;align-items:center;margin-bottom:4px;">' +
                '<input type="text" class="pm-input pm-abv-id" value="'+esc(v.id)+'" placeholder="ID" style="width:100px;font-size:12px;" />' +
                '<input type="text" class="pm-input pm-abv-name" value="'+esc(v.name)+'" placeholder="Name" style="flex:1;font-size:12px;" />' +
                '<input type="number" class="pm-input pm-abv-weight" value="'+(v.weight||50)+'" min="1" max="100" style="width:60px;font-size:12px;" title="Traffic %" />' +
                '<span style="font-size:11px;color:#6d7175;">%</span>' +
                '<button type="button" class="pm-btn pm-btn--secondary pm-btn--sm pm-abv-remove" style="color:#d72c0d;padding:2px 6px;">✕</button>' +
                '</div>';
        }

        // Load existing
        $.ajax({
            url: pmSgtmAdmin.ajaxUrl, method: 'POST',
            data: {action:'pm_sgtm_get_ab_tests',nonce:pmSgtmAdmin.nonce},
            success: function(r) {
                if(r.success && r.data && r.data.length) {
                    r.data.forEach(function(t) { abList.append(abRow(t)); });
                }
            }
        });

        $('#pm-ab-add').on('click', function() { abList.append(abRow()); });
        abList.on('click', '.pm-ab-remove', function() { $(this).closest('.pm-ab-row').remove(); });
        abList.on('click', '.pm-ab-add-variant', function() {
            $(this).prev('.pm-ab-variants').append(abVariantRow());
        });
        abList.on('click', '.pm-abv-remove', function() { $(this).closest('.pm-ab-variant').remove(); });

        $('#pm-ab-save').on('click', function() {
            var btn = $(this);
            var tests = [];
            abList.find('.pm-ab-row').each(function() {
                var $r = $(this);
                var variants = [];
                $r.find('.pm-ab-variant').each(function() {
                    variants.push({
                        id: $(this).find('.pm-abv-id').val().trim(),
                        name: $(this).find('.pm-abv-name').val().trim(),
                        weight: parseInt($(this).find('.pm-abv-weight').val()) || 50
                    });
                });
                tests.push({
                    id: $r.data('id'),
                    name: $r.find('.pm-ab-name').val().trim(),
                    active: $r.find('.pm-ab-active').is(':checked'),
                    variants: variants
                });
            });
            btn.prop('disabled', true).text('Saving...');
            $.ajax({
                url: pmSgtmAdmin.ajaxUrl, method: 'POST',
                data: {action:'pm_sgtm_save_ab_tests',nonce:pmSgtmAdmin.nonce,tests:JSON.stringify(tests)},
                success: function(r) {
                    btn.prop('disabled', false).text(r.success ? '✓ Saved!' : 'Error');
                    setTimeout(function() { btn.text('Save tests'); }, 2000);
                }
            });
        });

        // ── Catalogue Sync ──
        $('#pm-catalogue-sync-btn').on('click', function() {
            var btn = $(this);
            var status = $('#pm-sync-status');
            btn.prop('disabled', true).text('Syncing...');
            status.text('Starting sync...');

            function doSync(page) {
                $.ajax({
                    url: pmSgtmAdmin.ajaxUrl,
                    method: 'POST',
                    data: { 
                        action: 'pm_sgtm_bulk_catalogue_sync', 
                        nonce: pmSgtmAdmin.nonce,
                        paged: page
                    },
                    success: function(res) {
                        if (res.success) {
                            if (res.data.finished) {
                                status.text('✅ ' + res.data.message);
                                btn.prop('disabled', false).text('Sync catalog now');
                                setTimeout(function() { status.fadeOut(); }, 5000);
                            } else {
                                status.text(res.data.message);
                                doSync(res.data.paged);
                            }
                        } else {
                            status.text('❌ Error: ' + (res.data && res.data.message || 'Unknown'));
                            btn.prop('disabled', false).text('Sync catalog now');
                        }
                    },
                    error: function() {
                        status.text('❌ Request failed');
                        btn.prop('disabled', false).text('Sync catalog now');
                    }
                });
            }

            doSync(1);
        });

        // ── Helper ──
        function resetBtn(btn, delay) {
            setTimeout(function() {
                btn.prop('disabled', false).text(i18n.testBtn || 'Test');
            }, delay);
        }
    });
})(jQuery);
