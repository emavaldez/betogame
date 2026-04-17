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

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(5000);

    // Check if game engine exists by checking for renderer on canvas
    const check = await page.evaluate(() => {
        const canvas = document.getElementById('game-canvas');

        // Check if Three.js renderer was attached (it sets _context attribute)
        const hasWebGL = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));

        // Check if the renderer has a specific attribute
        const attrs = Array.from(canvas.attributes).map(a => `${a.name}="${a.value}"`);

        // Check if there's a Three.js renderer context
        const gl = canvas.getContext('webgl');

        return {
            hasWebGL,
            width: canvas.width,
            height: canvas.height,
            glVersion: gl ? gl.getParameter(gl.VERSION) : 'NO_GL',
            attrs,
        };
    });

    console.log('=== CHECK ===');
    console.log(JSON.stringify(check, null, 2));

    // Show all messages sorted by type
    const errors = allConsole.filter(m => m.includes('error') || m.includes('ERROR'));
    const beto = allConsole.filter(m => m.includes('[BETO]'));
    const vite = allConsole.filter(m => m.includes('vite') || m.includes('VITE'));

    console.log('\n=== BETO LOGS ===');
    beto.forEach(m => console.log(m));

    console.log('\n=== VITE LOGS ===');
    vite.forEach(m => console.log(m));

    console.log('\n=== ERRORS ===');
    errors.forEach(m => console.log(m));

    await browser.close();
})();
