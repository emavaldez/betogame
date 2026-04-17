import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const allMessages = [];
    page.on('console', msg => {
        allMessages.push(`[${msg.type()}] ${msg.text()}`);
    });
    page.on('pageerror', err => {
        allMessages.push(`[PAGE_ERROR] ${err.message}`);
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);

    console.log('=== BEFORE CLICK ===');
    let beforeClick = await page.evaluate(() => {
        return {
            startScreen: document.getElementById('start-screen').style.display,
            levelSelect: document.getElementById('level-select')?.style.display,
        };
    });
    console.log(JSON.stringify(beforeClick));

    // Click START button
    await page.click('#start-btn');
    await page.waitForTimeout(2000);

    console.log('\n=== AFTER START CLICK ===');
    let afterStart = await page.evaluate(() => {
        return {
            startScreen: document.getElementById('start-screen').style.display,
            levelSelect: document.getElementById('level-select')?.style.display,
        };
    });
    console.log(JSON.stringify(afterStart));

    // Click level 1 button
    await page.click('.level-btn[data-level="1"]');
    await page.waitForTimeout(3000);

    console.log('\n=== AFTER LEVEL CLICK ===');
    let afterLevel = await page.evaluate(() => {
        return {
            levelSelect: document.getElementById('level-select')?.style.display,
            startScreen: document.getElementById('start-screen').style.display,
        };
    });
    console.log(JSON.stringify(afterLevel));

    // Check canvas state after game starts
    let canvasState = await page.evaluate(() => {
        const canvas = document.getElementById('game-canvas');
        return {
            width: canvas?.width,
            height: canvas?.height,
            displayStyle: window.getComputedStyle(canvas).display,
        };
    });
    console.log('\n=== CANVAS STATE ===');
    console.log(JSON.stringify(canvasState));

    // Check if game engine created scene objects
    let sceneObjects = await page.evaluate(() => {
        // Try to access the game engine's scene
        if (typeof game !== 'undefined') {
            return {
                gameDefined: true,
                betoExists: !!game.beto,
            };
        }
        return { gameDefined: false };
    });
    console.log('\n=== GAME ENGINE ===');
    console.log(JSON.stringify(sceneObjects));

    // Show all error/warning messages
    const errors = allMessages.filter(m => m.includes('error') || m.includes('ERROR') || m.includes('[PAGE_ERROR]'));
    if (errors.length > 0) {
        console.log('\n=== ERRORS ===');
        errors.forEach(m => console.log(m));
    }

    // Show any messages about THREE or import
    const relevant = allMessages.filter(m =>
        m.includes('THREE') || m.includes('three') || m.includes('import') ||
        m.includes('module') || m.includes('GameEngine') || m.includes('startGame')
    );
    if (relevant.length > 0) {
        console.log('\n=== RELEVANT MESSAGES ===');
        relevant.forEach(m => console.log(m));
    }

    // Take screenshot after game starts
    await page.screenshot({ path: '/Users/emmanuelvaldez/beto-game/debug-after-start.png' });
    console.log('\nScreenshot saved');

    await browser.close();
})();
