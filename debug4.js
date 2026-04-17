import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Capture ALL console messages and network errors
    const allMessages = [];
    page.on('console', msg => {
        allMessages.push(`[${msg.type()}] ${msg.text()}`);
    });
    page.on('pageerror', err => {
        allMessages.push(`[PAGE_ERROR] ${err.message}`);
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(5000);

    // Check the module script execution by evaluating in the same context
    const result = await page.evaluate(() => {
        // Check if game engine was created
        return {
            canvas: document.getElementById('game-canvas') ? 'exists' : 'missing',
            container: document.getElementById('game-container') ? 'exists' : 'missing',
            startScreen: document.getElementById('start-screen') ? 'visible' : 'hidden',
        };
    });

    console.log('=== DOM CHECK ===');
    console.log(JSON.stringify(result, null, 2));

    // Check all network requests for failures
    const failedRequests = await page.evaluate(() => {
        return performance.getEntriesByType('resource')
            .filter(e => e.name.includes('three') || e.name.includes('module'))
            .map(e => ({
                name: e.name,
                type: e.initiatorType,
                duration: e.duration.toFixed(2),
                transferSize: e.transferSize
            }));
    });

    console.log('\n=== THREE.JS NETWORK ===');
    console.log(JSON.stringify(failedRequests, null, 2));

    // Show first 30 messages
    console.log('\n=== ALL MESSAGES (first 30) ===');
    allMessages.slice(0, 30).forEach(m => console.log(m));

    // Check if there are any network request failures
    const netErrors = await page.evaluate(() => {
        return performance.getEntriesByType('resource')
            .filter(e => e.name.includes('three'))
            .map(e => ({ url: e.name, duration: e.duration }));
    });

    console.log('\n=== THREE.JS RESOURCE DETAILS ===');
    console.log(JSON.stringify(netErrors, null, 2));

    await browser.close();
})();
