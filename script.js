const { chromium } = require('playwright');
const fs = require('fs');

const CONCURRENCY = 3;        // number of parallel tabs (keep low: 2–5)
const MIN_DELAY = 2000;
const MAX_DELAY = 5000;
const MAX_RETRIES = 3;

function randomDelay() {
  const ms = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY)) + MIN_DELAY;
  return new Promise(res => setTimeout(res, ms));
}

async function withdrawRequest(context, username, workerId) {
  const page = await context.newPage();
  const url = `https://www.instagram.com/${username}/`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🧵 [W${workerId}] ${username} attempt ${attempt}`);

      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await randomDelay();

      const requestedBtn = page.locator('button').filter({ hasText: 'Requested' });

      if (await requestedBtn.count() === 0) {
        console.log(`❌ [W${workerId}] No request: ${username}`);
        await page.close();
        return true;
      }

      // 👉 Click Requested
      await requestedBtn.first().click();

      // 👉 WAIT for modal to appear + Unfollow button
      const unfollowBtn = page.locator('button').filter({ hasText: 'Unfollow' });

      await unfollowBtn.first().waitFor({ timeout: 5000 }); // key fix
      await randomDelay();

      // 👉 Click Unfollow
      await unfollowBtn.first().click();

      console.log(`✅ [W${workerId}] Withdrawn: ${username}`);

      await randomDelay();
      await page.close();
      return true;

    } catch (err) {
      console.log(`⚠️ [W${workerId}] Retry ${attempt} failed for ${username}`);

      if (attempt === MAX_RETRIES) {
        console.log(`❌ [W${workerId}] Failed permanently: ${username}`);
        await page.close();
        return false;
      }

      await new Promise(res => setTimeout(res, 4000));
    }
  }
}

// Worker pool
async function runWorkers(context, usernames) {
  let index = 0;
  let success = 0;
  let failed = 0;

  async function worker(workerId) {
    while (index < usernames.length) {
      const currentIndex = index++;
      const username = usernames[currentIndex];

      const result = await withdrawRequest(context, username, workerId);

      if (result) success++;
      else failed++;

      await randomDelay(); // spacing between tasks
    }
  }

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker(i + 1));
  }

  await Promise.all(workers);

  return { success, failed };
}

(async () => {
  const browser = await chromium.launch({ headless: false });

  let context;

  if (fs.existsSync('auth.json')) {
    context = await browser.newContext({ storageState: 'auth.json' });
  } else {
    context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://www.instagram.com/accounts/login/');
    console.log("👉 Login manually, then press ENTER...");
    await new Promise(resolve => process.stdin.once('data', resolve));

    await context.storageState({ path: 'auth.json' });
  }

  const usernames = fs.readFileSync('usernames.txt', 'utf-8')
    .split('\n')
    .map(u => u.trim())
    .filter(Boolean);

  const { success, failed } = await runWorkers(context, usernames);

  console.log(`\n🎯 Done:
  ✅ Success: ${success}
  ❌ Failed: ${failed}
  `);

  await browser.close();
})();