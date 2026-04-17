import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('pageerror', err => {
        console.log(`[PAGE_ERROR] ${err.message}`);
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);

    // Check canvas pixel BEFORE clicking (should be black since no objects in scene)
    const before = await page.evaluate(() => {
        const canvas = document.getElementById('game-canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return 'no-gl';

        const pixels = new Uint8Array(4);
        gl.readPixels(canvas.width/2, canvas.height/2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        return `center: R=${pixels[0]} G=${pixels[1]} B=${pixels[2]}`;
    });

    console.log('=== BEFORE START (should be black) ===');
    console.log(before);

    // Click through to start game
    await page.click('#start-btn');
    await page.waitForTimeout(500);
    await page.click('.level-btn[data-level="1"]');
    await page.waitForTimeout(3000);

    // Check canvas pixel AFTER game starts
    const after = await page.evaluate(() => {
        const canvas = document.getElementById('game-canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return 'no-gl';

        const pixels = new Uint8Array(4);
        gl.readPixels(canvas.width/2, canvas.height/2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        return `center: R=${pixels[0]} G=${pixels[1]} B=${pixels[2]}`;
    });

    console.log('\n=== AFTER START (should have green ground) ===');
    console.log(after);

    // Sample multiple pixels across the canvas
    const multiSample = await page.evaluate(() => {
        const canvas = document.getElementById('game-canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return 'no-gl';

        const pixels = new Uint8Array(canvas.width * canvas.height * 4);
        gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        // Sample a few points
        const samples = [
            { x: Math.floor(canvas.width/2), y: Math.floor(canvas.height/2) },
            { x: 10, y: 10 },
            { x: canvas.width - 10, y: canvas.height - 10 },
        ];

        return samples.map(s => {
            const i = (s.y * canvas.width + s.x) * 4;
            return `(${s.x},${s.y}): R=${pixels[i]} G=${pixels[i+1]} B=${pixels[i+2]}`;
        });
    });

    console.log('\n=== MULTI-SAMPLE ===');
    multiSample.forEach(s => console.log(s));

    // Check if the scene has objects by looking at renderer info
    const rendererInfo = await page.evaluate(() => {
        // We can't access `game` directly since it's module-scoped
        // But we can check if the canvas has been rendered to
        const canvas = document.getElementById('game-canvas');
        return {
            width: canvas.width,
            height: canvas.height,
        };
    });

    console.log('\n=== RENDERER INFO ===');
    console.log(JSON.stringify(rendererInfo, null, 2));

    await browser.close();
})();
