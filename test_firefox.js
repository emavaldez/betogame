import { firefox } from 'playwright';

(async () => {
    const browser = await firefox.launch();
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

    // Check WebGL support in Firefox headless
    const webglCheck = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return {
            hasWebGL: !!gl,
            glVersion: gl ? gl.getParameter(gl.VERSION) : 'N/A',
            glRenderer: gl ? gl.getParameter(gl.RENDERER) : 'N/A',
        };
    });

    console.log('=== FIREFOX WEBGL CHECK ===');
    console.log(JSON.stringify(webglCheck, null, 2));

    // Check if game engine created renderer
    const gameCheck = await page.evaluate(() => {
        // Game is module-scoped, but we can check the canvas for renderer attributes
        const canvas = document.getElementById('game-canvas');
        return {
            canvasExists: !!canvas,
            width: canvas?.width,
            height: canvas?.height,
            hasWebGLContext: !!canvas.getContext('webgl'),
        };
    });

    console.log('\n=== GAME CHECK ===');
    console.log(JSON.stringify(gameCheck, null, 2));

    // Click through to start game
    await page.click('#start-btn');
    await page.waitForTimeout(500);
    await page.click('.level-btn[data-level="1"]');
    await page.waitForTimeout(3000);

    // Check canvas pixel after game starts
    const postGame = await page.evaluate(() => {
        const canvas = document.getElementById('game-canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return 'no-gl';

        const pixels = new Uint8Array(4);
        gl.readPixels(canvas.width/2, canvas.height/2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        return `center: R=${pixels[0]} G=${pixels[1]} B=${pixels[2]}`;
    });

    console.log('\n=== POST-GAME CANVAS ===');
    console.log(postGame);

    // Show errors if any
    if (allConsole.length > 0) {
        console.log('\n=== ERRORS ===');
        allConsole.forEach(e => console.log(e));
    }

    // Take screenshot
    await page.screenshot({ path: '/Users/emmanuelvaldez/beto-game/test-firefox-screenshot.png' });
    console.log('\nScreenshot saved');

    await browser.close();
})();
