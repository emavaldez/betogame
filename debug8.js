import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Capture all errors
    const pageErrors = [];
    page.on('pageerror', err => {
        pageErrors.push(`${err.message}\n${err.stack}`);
    });

    const consoleMsgs = [];
    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            consoleMsgs.push(`[${msg.type()}] ${msg.text()}`);
        }
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(5000);

    // Check if the module script executed by looking at DOM changes
    const domState = await page.evaluate(() => {
        // The game engine should have created a renderer on the canvas
        const canvas = document.getElementById('game-canvas');
        return {
            canvasHasContext: !!canvas.getContext,
            canvasWidth: canvas?.width,
            canvasHeight: canvas?.height,
            // Check if the start screen is still visible (game should have initialized)
            startScreenDisplay: document.getElementById('start-screen')?.style.display,
        };
    });

    console.log('=== DOM STATE ===');
    console.log(JSON.stringify(domState, null, 2));

    // Now try to evaluate THREE in the module scope using a dynamic script
    const threeCheck = await page.evaluate(() => {
        // Create a temporary inline module script to check THREE availability
        return new Promise(resolve => {
            const s = document.createElement('script');
            s.type = 'module';
            s.textContent = `
                import * as THREE from '/node_modules/.vite/deps/three.js?v=2df7403d';
                window._threeCheck = {
                    Scene: typeof THREE.Scene,
                    PerspectiveCamera: typeof THREE.PerspectiveCamera,
                    WebGLRenderer: typeof THREE.WebGLRenderer,
                };
                try {
                    const scene = new THREE.Scene();
                    window._threeSceneOk = true;
                } catch(e) {
                    window._threeSceneErr = e.message;
                }
            `;
            document.head.appendChild(s);
            setTimeout(() => resolve({
                Scene: window._threeCheck?.Scene,
                Camera: window._threeCheck?.PerspectiveCamera,
                Renderer: window._threeCheck?.WebGLRenderer,
                sceneOk: window._threeSceneOk,
                sceneErr: window._threeSceneErr,
            }), 2000);
        });
    });

    console.log('\n=== THREE.JS CHECK ===');
    console.log(JSON.stringify(threeCheck, null, 2));

    // Show all page errors
    if (pageErrors.length > 0) {
        console.log('\n=== PAGE ERRORS ===');
        pageErrors.forEach(e => console.log(e));
    }

    // Show all error/warning console messages
    if (consoleMsgs.length > 0) {
        console.log('\n=== CONSOLE ERRORS/WARNINGS ===');
        consoleMsgs.forEach(m => console.log(m));
    }

    await browser.close();
})();
