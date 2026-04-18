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

    // Inject debug globals BEFORE the module loads
    await page.addInitScript(() => {
        window._debugMessages = [];
        const origLog = console.log;
        console.log = function(...args) {
            window._debugMessages.push(args.join(' '));
            origLog.apply(console, args);
        };
    });

    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(5000);

    // Check Three.js loaded
    const threeCheck = await page.evaluate(() => {
        return {
            THREE_exists: typeof window.THREE !== 'undefined',
            __THREE__: typeof window.__THREE__ !== 'undefined',
            debugMessages: (window._debugMessages || []).length,
            first5Messages: (window._debugMessages || []).slice(0, 10)
        };
    });

    console.log('=== THREE.JS CHECK ===');
    console.log(JSON.stringify(threeCheck, null, 2));

    // Click start and level 1
    await page.click('#start-btn');
    await page.waitForTimeout(500);
    await page.click('.level-btn[data-level="1"]');
    await page.waitForTimeout(3000);

    // Check debug messages after game start
    const postCheck = await page.evaluate(() => {
        return {
            allMessages: window._debugMessages || [],
            sceneExists: typeof window.scene !== 'undefined',
            GExists: typeof window.G !== 'undefined'
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
