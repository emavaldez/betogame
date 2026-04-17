import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Inject a script BEFORE the module loads to catch errors
    await page.addInitScript(() => {
        window._importErrors = [];

        // Intercept module loading errors
        const originalAddEventListener = document.addEventListener;
        document.addEventListener = function(type, listener, options) {
            if (type === 'error') {
                window._hasError = true;
            }
            return originalAddEventListener.call(this, type, listener, options);
        };

        // Check import map before module runs
        window._importMap = JSON.stringify(document.querySelector('script[type="importmap"]').textContent);

        // Try to fetch Three.js directly
        window._threeFetchResult = null;
        fetch('https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js')
            .then(r => { window._threeFetchResult = `status: ${r.status}, size: ${r.headers.get('content-length')}`; })
            .catch(e => { window._threeFetchResult = `error: ${e.message}`; });
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);

    const result = await page.evaluate(() => {
        return {
            importMap: window._importMap,
            threeLoaded: typeof THREE !== 'undefined',
            hasError: window._hasError || false,
            threeFetch: window._threeFetchResult,
            // Check if the module script has an error
            scripts: Array.from(document.querySelectorAll('script[type="module"]')).map(s => ({
                src: s.src,
                text: s.textContent.substring(0, 100)
            })),
            // Check console for module errors by looking at window
            canvasSize: document.getElementById('game-canvas')?.getBoundingClientRect()
        };
    });

    console.log('=== DETAILED DEBUG ===');
    console.log(JSON.stringify(result, null, 2));

    await browser.close();
})();
