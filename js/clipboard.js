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
        try {
            textArea.focus();
            textArea.select();
            return doc.execCommand('copy');
        } catch (e) {
            return false;
        } finally {
            doc.body.removeChild(textArea);
        }
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

    // 按鈕回饋：render('copied' | 'idle')；schedule/cancel 同 setTimeout/clearTimeout。
    // begin() 取得 token；reset() 或下一次 begin() 之後，舊 token 的結果一律忽略，
    // 避免非同步 writeText 晚到時對已變更的結果顯示「已複製」。
    function createCopyFeedback(opts) {
        const holdMs = opts.holdMs || 2000;
        let generation = 0;
        let timer = null;

        function clearTimer() {
            if (timer !== null) {
                opts.cancel(timer);
                timer = null;
            }
        }

        function toIdle() {
            clearTimer();
            opts.render('idle');
        }

        return {
            begin() {
                generation += 1;
                return generation;
            },
            succeed(token) {
                if (token !== generation) return false;
                clearTimer();
                opts.render('copied');
                timer = opts.schedule(() => {
                    timer = null;
                    opts.render('idle');
                }, holdMs);
                return true;
            },
            fail(token) {
                if (token !== generation) return false;
                toIdle();
                return true;
            },
            reset() {
                generation += 1;
                toIdle();
            }
        };
    }

    return { legacyCopy, copyText, createCopyFeedback };
}));
