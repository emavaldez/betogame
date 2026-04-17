import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Inject a global error catcher BEFORE anything else
    await page.addInitScript(() => {
        window._debugLog = [];

        // Capture all uncaught errors
        window.addEventListener('error', (e) => {
            window._debugLog.push(`UNCAUGHT: ${e.message} at ${e.filename}:${e.lineno}`);
        });

        window.addEventListener('unhandledrejection', (e) => {
            window._debugLog.push(`REJECTION: ${e.reason}`);
        });

        // Wrap console.error to capture it too
        const origError = console.error;
        console.error = function(...args) {
            window._debugLog.push(`CONSOLE_ERROR: ${args.map(a => String(a)).join(' ')}`);
            origError.apply(console, args);
        };

        // Override GameEngine constructor to log steps
        const origOpen = window.open;
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(5000);

    const debugInfo = await page.evaluate(() => {
        return {
            debugLog: window._debugLog,
            // Try to manually create THREE.Scene
            threeTest: (() => {
                try {
                    const scene = new THREE.Scene();
                    return 'Scene created OK';
                } catch(e) {
                    return `THREE error: ${e.message}`;
                }
            })(),
        };
    });

    console.log('=== DEBUG INFO ===');
    console.log(JSON.stringify(debugInfo, null, 2));

    await browser.close();
})();
