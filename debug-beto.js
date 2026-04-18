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

    // Deep check what's in the scene
    const debug = await page.evaluate(() => {
        // Check Three.js
        const THREE = window.THREE;

        // Count scene children
        const sceneChildren = [];
        for (let i = 0; i < window.scene?.children.length; i++) {
            const child = window.scene.children[i];
            sceneChildren.push({
                type: child.type,
                name: child.name || '(no name)',
                visible: child.visible,
                childrenCount: child.children?.length || 0,
                position: child.position ? `(${child.position.x.toFixed(1)}, ${child.position.y.toFixed(1)}, ${child.position.z.toFixed(1)})` : 'N/A'
            });
        }

        // Check if Beto exists
        const beto = window.G?.beto;
        let betoInfo = null;
        if (beto) {
            betoInfo = {
                exists: true,
                meshExists: !!beto.mesh,
                position: beto.mesh?.position ? `(${beto.mesh.position.x.toFixed(1)}, ${beto.mesh.position.y.toFixed(1)}, ${beto.mesh.position.z.toFixed(1)})` : 'N/A',
                visible: beto.mesh?.visible,
                childrenCount: beto.mesh?.children?.length || 0,
                sceneChildrenCount: window.scene?.children.length || 0
            };
        }

        // Check cars
        const cars = window.G?.cars || [];

        return {
            beto: betoInfo,
            carsCount: cars.length,
            carInfos: cars.map(c => ({
                visible: c.visible,
                state: c.state,
                position: c.mesh?.position ? `(${c.mesh.position.x.toFixed(1)}, ${c.mesh.position.y.toFixed(1)}, ${c.mesh.position.z.toFixed(1)})` : 'N/A',
                childrenCount: c.mesh?.children?.length || 0,
                meshVisible: c.mesh?.visible
            })),
            sceneChildrenCount: window.scene?.children.length || 0,
            sceneChildren: sceneChildren.slice(0, 20) // first 20
        };
    });

    console.log('=== DEBUG BETO AND CARS ===');
    console.log(JSON.stringify(debug, null, 2));

    // Show errors
    const errors = allConsole.filter(m => m.includes('error') || m.includes('ERROR'));
    if (errors.length > 0) {
        console.log('\n=== ERRORS ===');
        errors.forEach(e => console.log(e));
    }

    // Show page errors specifically
    const pageErrors = allConsole.filter(m => m.includes('PAGE_ERROR'));
    if (pageErrors.length > 0) {
        console.log('\n=== PAGE ERRORS ===');
        pageErrors.forEach(e => console.log(e));
    }

    // Screenshot
    await page.screenshot({ path: '/Users/emmanuelvaldez/beto-game/debug-beto-screenshot.png' });
    console.log('\nScreenshot saved');

    await browser.close();
})();
