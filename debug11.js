import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Capture ALL console messages (including debug)
    const allConsole = [];
    page.on('console', msg => {
        const text = `[${msg.type()}] ${msg.text()}`;
        allConsole.push(text);
    });

    page.on('pageerror', err => {
        allConsole.push(`[PAGE_ERROR] ${err.message}`);
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(5000);

    // Show ALL console messages
    console.log('=== ALL CONSOLE MESSAGES ===');
    allConsole.forEach(m => console.log(m));

    // Check WebGL support on canvas
    const webglCheck = await page.evaluate(() => {
        const canvas = document.getElementById('game-canvas');

        // Try to get WebGL context directly
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        return {
            canvasExists: !!canvas,
            canvasWidth: canvas?.width,
            canvasHeight: canvas?.height,
            glAvailable: !!gl,
            glVersion: gl ? gl.getParameter(gl.VERSION) : 'N/A',
            glRenderer: gl ? gl.getParameter(gl.RENDERER) : 'N/A',
        };
    });

    console.log('\n=== WEBGL CHECK ===');
    console.log(JSON.stringify(webglCheck, null, 2));

    await browser.close();
})();
