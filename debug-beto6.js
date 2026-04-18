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

    // Show ALL console messages, organized by type
    const betoLogs = allConsole.filter(m => m.includes('[BETO]'));
    const errors = allConsole.filter(m => {
        const lower = m.toLowerCase();
        return lower.includes('error') || lower.includes('[error]');
    });
    const pageErrors = allConsole.filter(m => m.includes('PAGE_ERROR'));

    console.log('=== [BETO] LOGS ===');
    betoLogs.forEach(m => console.log(m));

    if (errors.length > 0) {
        console.log('\n=== ERRORS ===');
        errors.forEach(e => console.log(e));
    }

    if (pageErrors.length > 0) {
        console.log('\n=== PAGE ERRORS ===');
        pageErrors.forEach(e => console.log(e));
    }

    // Show non-BETO, non-error logs too
    const otherLogs = allConsole.filter(m => {
        return !m.includes('[BETO]') && !m.includes('error') && !m.includes('ERROR');
    });
    if (otherLogs.length > 0) {
        console.log('\n=== OTHER LOGS ===');
        otherLogs.forEach(m => console.log(m));
    }

    await browser.close();
})();
