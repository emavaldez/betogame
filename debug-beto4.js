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

    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(5000);

    // Click start and level 1
    await page.click('#start-btn');
    await page.waitForTimeout(500);
    await page.click('.level-btn[data-level="1"]');
    await page.waitForTimeout(3000);

    // Show ALL console messages
    console.log('=== ALL CONSOLE MESSAGES ===');
    allConsole.forEach(m => console.log(m));

    // Check canvas for WebGL context and renderer info
    const canvasInfo = await page.evaluate(() => {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return 'no-canvas';

        // Check attributes set by Three.js renderer
        const attrs = Array.from(canvas.attributes).map(a => `${a.name}="${a.value}"`);

        // Check canvas dimensions
        return {
            width: canvas.width,
            height: canvas.height,
            attrs
        };
    });

    console.log('\n=== CANVAS INFO ===');
    console.log(JSON.stringify(canvasInfo, null, 2));

    // Screenshot
    await page.screenshot({ path: '/Users/emmanuelvaldez/beto-game/debug-beto4-screenshot.png' });
    console.log('\nScreenshot saved');

    await browser.close();
})();
