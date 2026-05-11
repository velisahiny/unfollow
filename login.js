const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://www.instagram.com/accounts/login/');

    console.log("👉 Login manually in the browser...");

    await new Promise(resolve => process.stdin.once('data', resolve));

    await context.storageState({ path: 'auth.json' });

    console.log("✅ Session saved to auth.json");

    await browser.close();
})();