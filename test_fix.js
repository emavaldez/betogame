import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Capture all console messages
    const allConsole = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            allConsole.push(`[ERROR] ${msg.text()}`);
        }
    });

    page.on('pageerror', err => {
        allConsole.push(`[PAGE_ERROR] ${err.message}`);
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);

    // Click through to start game
    await page.click('#start-btn');
    await page.waitForTimeout(500);
    await page.click('.level-btn[data-level="1"]');
    await page.waitForTimeout(3000);

    // Check canvas pixel - should NOT be black anymore
    const check = await page.evaluate(() => {
        const canvas = document.getElementById('game-canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return 'no-gl';

        const pixels = new Uint8Array(4);
        // Sample center pixel - should be sky blue (135, 206, 235)
        gl.readPixels(canvas.width/2, canvas.height/2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        return `center: R=${pixels[0]} G=${pixels[1]} B=${pixels[2]}`;
    });

    console.log('=== CANVAS CHECK ===');
    console.log(check);

    // Check if WebGL context exists now
    const webglCheck = await page.evaluate(() => {
        const canvas = document.getElementById('game-canvas');
        return {
            hasWebGL: !!canvas.getContext('webgl'),
            width: canvas.width,
            height: canvas.height,
        };
    });

    console.log('\n=== WEBGL CHECK ===');
    console.log(JSON.stringify(webglCheck, null, 2));

    // Show errors if any
    if (allConsole.length > 0) {
        console.log('\n=== ERRORS ===');
        allConsole.forEach(e => console.log(e));
    }

    // Take screenshot
    await page.screenshot({ path: '/Users/emmanuelvaldez/beto-game/test-fix-screenshot.png' });
    console.log('\nScreenshot saved');

    await browser.close();
})();
