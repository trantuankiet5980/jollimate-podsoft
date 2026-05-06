/**
 * custom-track123-interceptor.js
 *
 * Intercepts Track123 API calls (fetch + XHR) and displays
 * user-friendly error messages when the API returns error codes.
 *
 * Error codes handled:
 *   B0001 — Invalid email / phone number
 *   B0002 — Order not found
 *   B0003 — Tracking not available yet
 *
 * Safe to load on every page — only activates when a track123.com
 * request is detected (i.e. on the Track Your Order page).
 */
(function () {
    'use strict';

    // ─── Error code → message map ────────────────────────────────────────────
    var ERROR_MAP = {
        B0001: {
            title: 'Invalid Email or Phone Number',
            msg: 'Please enter a valid email address (e.g. name@example.com) or phone number (e.g. +1234567890).',
        },
        B0002: {
            title: 'Order Not Found',
            msg: 'No order was found with that number. Please double-check your order number and try again.',
        },
        B0003: {
            title: 'Tracking Not Available Yet',
            msg: 'Your order is confirmed but tracking info is not yet available. Please check back in 24–48 hours.',
        },
        DEFAULT: {
            title: 'Something Went Wrong',
            msg: 'Could not retrieve tracking information. Please try again in a moment.',
        },
    };

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /** Check if a URL belongs to Track123 */
    function isTrack123Url(url) {
        return (
            typeof url === 'string' &&
            (url.includes('track123.com') || url.includes('anonymous-query'))
        );
    }

    /** Build and return the error banner element */
    function buildErrorBanner(code) {
        var info = ERROR_MAP[code] || ERROR_MAP.DEFAULT;

        var banner = document.createElement('div');
        banner.id = 't123-theme-error';
        banner.setAttribute('role', 'alert');
        banner.style.cssText = [
            'max-width:700px',
            'margin:20px auto 0',
            'background:#fef2f2',
            'border:1.5px solid #fecaca',
            'color:#b91c1c',
            'padding:14px 18px',
            'border-radius:10px',
            'font-size:14px',
            'display:flex',
            'align-items:flex-start',
            'gap:12px',
        ].join(';');

        banner.innerHTML =
            '<svg style="flex-shrink:0;margin-top:2px" width="18" height="18" viewBox="0 0 24 24"' +
            ' fill="none" stroke="#b91c1c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<circle cx="12" cy="12" r="10"/>' +
            '<line x1="12" y1="8" x2="12" y2="12"/>' +
            '<line x1="12" y1="16" x2="12.01" y2="16"/>' +
            '</svg>' +
            '<div>' +
            '<div style="font-weight:700;margin-bottom:4px">' + info.title + '</div>' +
            '<div style="font-size:13px;opacity:.85">' + info.msg + '</div>' +
            '</div>';

        return banner;
    }

    /** Find the best container inside the Track123 widget */
    function findTrack123Container() {
        return (
            document.querySelector('[id*="track123"]') ||
            document.querySelector('[class*="track123"]') ||
            document.querySelector('.track123-widget') ||
            document.querySelector('#track123-app') ||
            null
        );
    }

    // ─── Public API ──────────────────────────────────────────────────────────

    function showError(code) {
        // Remove previous banner if any
        hideError();

        var banner = buildErrorBanner(code);
        var container = findTrack123Container();

        if (container) {
            container.appendChild(banner);
        } else {
            // Track123 might still be rendering — retry after a short delay
            setTimeout(function () {
                var c = findTrack123Container();
                (c || document.body).appendChild(banner);
            }, 600);
        }

        // Scroll the banner into view smoothly
        setTimeout(function () {
            var el = document.getElementById('t123-theme-error');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 150);
    }

    function hideError() {
        var el = document.getElementById('t123-theme-error');
        if (el) el.remove();
    }

    /** Called with the parsed JSON response from any Track123 API call */
    function handleResponse(data) {
        if (!data) return;

        var code = data.code;
        var isError = code !== undefined && code !== '0' && code !== 0;

        if (isError) {
            showError(String(code));
        } else if (data.id || data.shipments || data.tracking) {
            // Successful tracking result — clear any lingering error
            hideError();
        }
    }

    // ─── Fetch interceptor ───────────────────────────────────────────────────
    var _origFetch = window.fetch;

    window.fetch = function () {
        var url = String(arguments[0] || '');
        var promise = _origFetch.apply(this, arguments);

        if (isTrack123Url(url)) {
            return promise.then(function (response) {
                // Clone so the original body is still readable by Track123
                response.clone().json().then(handleResponse).catch(function () { });
                return response;
            });
        }

        return promise;
    };

    // ─── XMLHttpRequest interceptor ──────────────────────────────────────────
    var _origXHROpen = XMLHttpRequest.prototype.open;
    var _origXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
        this._t123Url = String(url || '');
        return _origXHROpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function () {
        if (isTrack123Url(this._t123Url)) {
            var self = this;
            this.addEventListener('load', function () {
                try {
                    handleResponse(JSON.parse(self.responseText));
                } catch (e) { /* ignore JSON parse errors */ }
            });
        }
        return _origXHRSend.apply(this, arguments);
    };

    // ─── Hide error on user input ────────────────────────────────────────────
    document.addEventListener(
        'input',
        function (e) {
            var tag = e.target && e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') hideError();
        },
        true
    );
})();
