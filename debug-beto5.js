import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Capture ALL console messages
    const allConsole = [];
    page.on('console', msg => {
        const text = `[${msg.type()}] ${msg.text()}`;
        allConsole.push(text);
    });

    page.on('pageerror', err => {
        allConsole.push(`[PAGE_ERROR] ${err.message}`);
    });

    // Intercept console BEFORE module loads and expose scene/G globally
    await page.addInitScript(() => {
        window._debugMessages = [];

        // Wrap console.log to capture all messages
        const origLog = console.log;
        console.log = function(...args) {
            window._debugMessages.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
            origLog.apply(console, args);
        };

        // Override scene.add to track what's added
        const origAdd = THREE.Scene.prototype.add;
        THREE.Scene.prototype.add = function(obj) {
            const result = origAdd.call(this, obj);
            window._debugMessages.push(`[SCENE_ADD] type=${obj.type} name="${obj.name}" visible=${obj.visible}`);
            return result;
        };

        // Expose scene and G to window for debugging
        Object.defineProperty(window, '_scene', {
            get() { return scene; },
            configurable: true
        });
        Object.defineProperty(window, '_game', {
            get() { return G; },
            configurable: true
        });
    });

    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(5000);

    // Check Three.js loaded and initial messages
    const preCheck = await page.evaluate(() => {
        return {
            THREE_exists: typeof window.THREE !== 'undefined',
            scene_defined: typeof window._scene !== 'undefined',
            game_defined: typeof window._game !== 'undefined',
            messagesCount: (window._debugMessages || []).length,
            first10: (window._debugMessages || []).slice(0, 10)
        };
    });

    console.log('=== PRE-CHECK ===');
    console.log(JSON.stringify(preCheck, null, 2));

    // Click start and level 1
    await page.click('#start-btn');
    await page.waitForTimeout(500);
    await page.click('.level-btn[data-level="1"]');
    await page.waitForTimeout(3000);

    // Get all messages after game start
    const postCheck = await page.evaluate(() => {
        return {
            allMessages: window._debugMessages || []
        };
    });

    console.log('\n=== ALL MESSAGES ===');
    postCheck.allMessages.forEach(m => console.log(m));

    // Show errors
    const errors = allConsole.filter(m => m.includes('error') || m.includes('ERROR'));
    if (errors.length > 0) {
        console.log('\n=== ERRORS ===');
        errors.forEach(e => console.log(e));
    }

    const pageErrors = allConsole.filter(m => m.includes('PAGE_ERROR'));
    if (pageErrors.length > 0) {
        console.log('\n=== PAGE ERRORS ===');
        pageErrors.forEach(e => console.log(e));
    }

    await browser.close();
})();
