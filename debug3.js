import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Listen for all console messages
    const consoleMessages = [];
    page.on('console', msg => {
        const text = `[${msg.type()}] ${msg.text()}`;
        consoleMessages.push(text);
    });

    page.on('pageerror', err => {
        consoleMessages.push(`[PAGE_ERROR] ${err.message}`);
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(5000);

    // Check if THREE is available in the module scope
    const check = await page.evaluate(() => {
        // Check if import map exists
        const im = document.querySelector('script[type="importmap"]');
        return {
            importMapExists: !!im,
            importMapContent: im ? im.textContent : 'NONE',
            // The module script runs in its own scope, so THREE won't be on window
            // But let's check anyway
            threeOnWindow: typeof THREE !== 'undefined',
        };
    });

    console.log('=== CHECK ===');
    console.log(JSON.stringify(check, null, 2));

    // Now check the actual module error by looking at network requests
    const networkRequests = await page.evaluate(() => {
        const entries = performance.getEntriesByType('resource');
        return entries
            .filter(e => e.name.includes('three') || e.name.includes('index-'))
            .map(e => ({ name: e.name, status: e.transferSize > 0 ? 'loaded' : 'pending', duration: e.duration.toFixed(2) }));
    });

    console.log('\n=== NETWORK ===');
    console.log(JSON.stringify(networkRequests, null, 2));

    // Show relevant console messages
    const relevant = consoleMessages.filter(m =>
        m.includes('three') || m.includes('import') || m.includes('error') || m.includes('ERROR') ||
        m.includes('module') || m.includes('THREE')
    );

    if (relevant.length > 0) {
        console.log('\n=== RELEVANT MESSAGES ===');
        relevant.forEach(m => console.log(m));
    }

    await browser.close();
})();
