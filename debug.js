import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const errors = [];
    const logs = [];

    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            errors.push(`[${msg.type()}] ${msg.text()}`);
        }
    });

    page.on('pageerror', err => {
        errors.push(err.message);
    });

    try {
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(3000);

        // Check if canvas has content
        const canvasExists = await page.evaluate(() => {
            const canvas = document.getElementById('game-canvas');
            if (!canvas) return 'NO_CANVAS';
            const rect = canvas.getBoundingClientRect();
            return `CANVAS: ${rect.width}x${rect.height}`;
        });

        // Check if Three.js loaded
        const threeLoaded = await page.evaluate(() => {
            return typeof THREE !== 'undefined';
        });

        // Check if game engine exists
        const gameExists = await page.evaluate(() => {
            return typeof game !== 'undefined';
        });

        // Check canvas pixel data (is it all black?)
        const canvasPixels = await page.evaluate(() => {
            const canvas = document.getElementById('game-canvas');
            if (!canvas) return null;
            const ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!ctx) return 'NO_WEBGL';
            const pixels = new Uint8Array(4);
            ctx.readPixels(0, 0, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, pixels);
            return `pixel[0,0]: R=${pixels[0]} G=${pixels[1]} B=${pixels[2]} A=${pixels[3]}`;
        });

        console.log('=== DEBUG RESULTS ===');
        console.log(canvasExists);
        console.log(`Three.js loaded: ${threeLoaded}`);
        console.log(`Game exists: ${gameExists}`);
        console.log(canvasPixels);

        if (errors.length > 0) {
            console.log('\n=== ERRORS ===');
            errors.forEach(e => console.log(e));
        }

        // Take screenshot
        await page.screenshot({ path: '/Users/emmanuelvaldez/beto-game/debug-screenshot.png' });
        console.log('\nScreenshot saved');

    } catch (err) {
        console.error('Playwright error:', err.message);
    }

    await browser.close();
})();
