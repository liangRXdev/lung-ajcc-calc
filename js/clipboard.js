/*
 * 複製到剪貼簿與按鈕回饋狀態（DOM／計時器以參數注入，可於 Node 測試）。
 * 瀏覽器掛 window.LungClipboard；Node module.exports。
 */
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    } else {
        root.LungClipboard = api;
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // execCommand('copy') 後援；回傳是否成功
    function legacyCopy(text, doc) {
        const textArea = doc.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '-1000px';
        textArea.style.left = '-1000px';
        doc.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = doc.execCommand('copy');
        doc.body.removeChild(textArea);
        return successful;
    }

    // 先試 Clipboard API，失敗改用 legacyCopy；resolve 為是否成功，不 reject
    function copyText(text, env) {
        const fallback = () => {
            try {
                return env.legacyCopy(text);
            } catch (e) {
                return false;
            }
        };
        if (env.clipboard && env.clipboard.writeText) {
            return env.clipboard.writeText(text).then(() => true, fallback);
        }
        return Promise.resolve(fallback());
    }

    // 按鈕回饋：render('copied' | 'idle')；schedule 同 setTimeout
    function createCopyFeedback(opts) {
        const holdMs = opts.holdMs || 2000;
        return {
            begin() {
                return 0;
            },
            succeed() {
                opts.render('copied');
                opts.schedule(() => opts.render('idle'), holdMs);
                return true;
            },
            fail() {
                return true;
            },
            reset() {
                opts.render('idle');
            }
        };
    }

    return { legacyCopy, copyText, createCopyFeedback };
}));
