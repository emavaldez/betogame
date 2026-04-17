import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Capture ALL errors and console messages
    const allErrors = [];
    page.on('pageerror', err => {
        allErrors.push(`[PAGE_ERROR] ${err.message}\n${err.stack}`);
    });

    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(5000);

    console.log('=== ALL PAGE ERRORS ===');
    if (allErrors.length === 0) console.log('NO PAGE ERRORS CAPTURED');
    else allErrors.forEach(e => console.log(e));

    console.log('\n=== ALL CONSOLE MESSAGES ===');
    consoleMessages.forEach(m => console.log(m));

    // Check if the module script is even being loaded
    const moduleScript = await page.evaluate(() => {
        const scripts = document.querySelectorAll('script[type="module"]');
        return Array.from(scripts).map(s => ({
            src: s.src,
            hasTextContent: !!s.textContent,
        }));
    });

    console.log('\n=== MODULE SCRIPTS ===');
    console.log(JSON.stringify(moduleScript, null, 2));

    // Check if there's a Vite HMR error overlay
    const hasErrorOverlay = await page.evaluate(() => {
        return !!document.querySelector('#vite-error-overlay');
    });
    console.log('\n=== VITE ERROR OVERLAY ===', hasErrorOverlay);

    // Check the actual page content
    const bodyContent = await page.evaluate(() => document.body.innerHTML.substring(0, 500));
    console.log('\n=== BODY CONTENT (first 500 chars) ===');
    console.log(bodyContent);

    await browser.close();
})();
