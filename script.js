const { chromium } = require('playwright');
const fs = require('fs');

const CONCURRENCY = 3;
const MIN_DELAY = 2000;
const MAX_DELAY = 5000;

function randomDelay() {
  const ms = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY)) + MIN_DELAY;
  return new Promise(r => setTimeout(r, ms));
}

async function withdrawRequest(context, username, workerId) {
  const page = await context.newPage();
  const url = `https://www.instagram.com/${username}/`;

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await randomDelay();

    const requestedBtn = page.locator('button:has-text("Requested")');

    if (await requestedBtn.count() === 0) {
      await page.close();
      return;
    }

    await requestedBtn.first().click();
    await randomDelay();

    const unfollowBtn = page.locator('button:has-text("Unfollow")');

    if (await unfollowBtn.count() > 0) {
      await unfollowBtn.first().click();
    }

    console.log(`✅ [W${workerId}] ${username}`);
    await page.close();

  } catch (e) {
    console.log(`❌ [W${workerId}] ${username} failed`);
    await page.close();
  }
}

async function worker(context, list, id, indexRef) {
  while (true) {
    let i = indexRef.value++;
    if (i >= list.length) return;

    await withdrawRequest(context, list[i], id);
    await randomDelay();
  }
}

(async () => {
  const browser = await chromium.launch({
    headless: true   // 👈 FULL BACKGROUND MODE
  });

  const context = await browser.newContext({
    storageState: 'auth.json'  // 👈 AUTHENTICATION RESTORED
  });

  const usernames = fs.readFileSync('usernames.txt', 'utf-8')
      .split('\n')
      .map(u => u.trim())
      .filter(Boolean);

  const indexRef = { value: 0 };

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker(context, usernames, i + 1, indexRef));
  }

  await Promise.all(workers);

  console.log("🎯 Done");
  await browser.close();
})();