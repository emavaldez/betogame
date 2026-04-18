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

    // Check if scene is accessible via module scope
    const preCheck = await page.evaluate(() => {
        return {
            scene: typeof window.scene,
            G: typeof window.G,
            canvas: !!document.getElementById('game-canvas'),
            sceneChildren: 0 // placeholder
        };
    });

    console.log('=== PRE-CHECK ===');
    console.log(JSON.stringify(preCheck, null, 2));

    // Click start and level 1
    await page.click('#start-btn');
    await page.waitForTimeout(500);
    await page.click('.level-btn[data-level="1"]');
    await page.waitForTimeout(3000);

    // Check canvas pixel colors to see what's rendered
    const pixels = await page.evaluate(() => {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return 'no-canvas';

        const gl = canvas.getContext('webgl');
        if (!gl) return 'no-gl';

        // Sample multiple points on the canvas
        const w = canvas.width;
        const h = canvas.height;
        const samples = [
            { x: Math.floor(w/2), y: Math.floor(h/2), label: 'center' },
            { x: Math.floor(w/4), y: Math.floor(h/2), label: 'left' },
            { x: Math.floor(3*w/4), y: Math.floor(h/2), label: 'right' },
            { x: Math.floor(w/2), y: Math.floor(h/4), label: 'top' },
            { x: 10, y: 10, label: 'corner' },
        ];

        const result = {};
        const pixels = new Uint8Array(4);
        for (const s of samples) {
            gl.readPixels(s.x, h - s.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            result[s.label] = `R=${pixels[0]} G=${pixels[1]} B=${pixels[2]}`;
        }

        // Count canvas children via DOM (Three.js adds meshes as... wait, WebGL doesn't use DOM)
        // Instead check canvas attributes set by Three.js renderer
        const attrs = Array.from(canvas.attributes).map(a => a.name);

        return { canvasSize: `${w}x${h}`, samples, attrs };
    });

    console.log('\n=== PIXEL SAMPLES ===');
    console.log(JSON.stringify(pixels, null, 2));

    // Now try to access scene through the module - inject a script tag
    const sceneDebug = await page.evaluate(() => {
        // Try to find any THREE instance
        const threeKeys = Object.keys(window).filter(k => k.toLowerCase().includes('three'));

        // Check if there's a global scene variable
        let sceneCount = 0;
        try {
            // The canvas has a _context attribute from Three.js WebGLRenderer
            const canvas = document.getElementById('game-canvas');
            if (canvas) {
                sceneCount = canvas.getAttribute('_context') ? 1 : 0;
            }
        } catch(e) {}

        return { threeKeys, sceneCount };
    });

    console.log('\n=== SCENE DEBUG ===');
    console.log(JSON.stringify(sceneDebug, null, 2));

    // Check if there's an error in the module loading
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

    // Screenshot
    await page.screenshot({ path: '/Users/emmanuelvaldez/beto-game/debug-beto2-screenshot.png' });
    console.log('\nScreenshot saved');

    await browser.close();
})();
