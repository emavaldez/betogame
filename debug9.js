import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Capture everything
    const allConsole = [];
    page.on('console', msg => {
        allConsole.push(`[${msg.type()}] ${msg.text()}`);
    });
    page.on('pageerror', err => {
        allConsole.push(`[PAGE_ERROR] ${err.message}`);
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(5000);

    // Inject a diagnostic script that runs in the module context
    const diag = await page.evaluate(() => {
        // Check if game variable exists (it won't since it's module-scoped)
        // But we can check if the canvas has a WebGL context that's active

        const canvas = document.getElementById('game-canvas');
        const gl = canvas.getContext('webgl');

        return {
            // WebGL context info
            glVersion: gl ? gl.getParameter(gl.VERSION) : 'no-gl',
            glRenderer: gl ? gl.getParameter(gl.RENDERER) : 'no-gl',
            glMaxViewportDims: gl ? JSON.stringify(gl.getParameter(gl.MAX_VIEWPORT_DIMS)) : 'no-gl',

            // Is context lost?
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,

            // Check if there's a background color set (default is black)
            // The issue might be that the scene has no objects yet!

            // Check if requestAnimationFrame is running by checking performance
            timeSinceNavigation: performance.now().toFixed(0),

            // Check if the canvas has any non-black pixels by sampling a few
            samplePixels: (() => {
                if (!gl) return 'no-gl';
                const pixels = new Uint8Array(4);
                // Sample center pixel
                gl.readPixels(canvas.width/2, canvas.height/2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                return `center: R=${pixels[0]} G=${pixels[1]} B=${pixels[2]} A=${pixels[3]}`;
            })(),
        };
    });

    console.log('=== WEBGL DIAGNOSTIC ===');
    console.log(JSON.stringify(diag, null, 2));

    // Now the key question: is the scene empty?
    // The game engine creates a renderer and starts the loop, but only adds objects when startGame is called
    // So initially the scene has: ambient light + directional light, but NO geometry
    // The loop calls renderer.render() which renders an empty scene = black screen

    // Let's check if the game engine is actually running by checking for the loop
    const gameCheck = await page.evaluate(() => {
        // The GameEngine is instantiated at module level as `const game`
        // But it's not accessible from window scope in a module

        // Let's check if there are any event listeners on the canvas
        const canvas = document.getElementById('game-canvas');

        // Check if THREE is available in the global scope (it shouldn't be for ES modules)
        const threeAvailable = typeof THREE !== 'undefined';

        // Check if the import map is being used correctly by Vite
        const importMap = document.querySelector('script[type="importmap"]');

        return {
            threeAvailable,
            importMapExists: !!importMap,
            canvasExists: !!canvas,
        };
    });

    console.log('\n=== GAME CHECK ===');
    console.log(JSON.stringify(gameCheck, null, 2));

    // The real issue: the game loop IS running but the scene is EMPTY
    // There are no objects in the scene until startGame() is called!
    // The loop renders an empty scene = black screen

    // Let's verify by clicking through the game flow
    await page.click('#start-btn');
    await page.waitForTimeout(1000);
    await page.click('.level-btn[data-level="1"]');
    await page.waitForTimeout(3000);

    // Now check canvas pixels after game starts
    const postGame = await page.evaluate(() => {
        const canvas = document.getElementById('game-canvas');
        const gl = canvas.getContext('webgl');
        if (!gl) return 'no-gl';

        const pixels = new Uint8Array(4);
        // Sample center pixel
        gl.readPixels(canvas.width/2, canvas.height/2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        return `center: R=${pixels[0]} G=${pixels[1]} B=${pixels[2]} A=${pixels[3]}`;
    });

    console.log('\n=== POST-GAME CANVAS PIXEL ===');
    console.log(postGame);

    // Show all error messages
    const errors = allConsole.filter(m => m.includes('error') || m.includes('ERROR'));
    if (errors.length > 0) {
        console.log('\n=== ERRORS ===');
        errors.forEach(e => console.log(e));
    }

    await browser.close();
})();
