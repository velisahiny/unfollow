const { chromium } = require('playwright');
const fs = require('fs');

const CONCURRENCY = 3;
const MIN_DELAY = 2000;
const MAX_DELAY = 5000;
const MAX_RETRIES = 3;

function randomDelay() {
  const ms = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY)) + MIN_DELAY;
  return new Promise(r => setTimeout(r, ms));
}

function extractUsernames(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  const usernames = [];

  for (const item of data) {
    if (!item.label_values) continue;

    for (const label of item.label_values) {
      if (label.label === "Username" && label.value) {
        usernames.push(label.value);
      }
    }
  }

  return [...new Set(usernames)]; // remove duplicates
}

async function withdrawRequest(context, username, workerId) {
  const page = await context.newPage();
  const url = `https://www.instagram.com/${username}/`;

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await randomDelay();

    const requestedBtn = page.locator('button:has-text("Requested")');

    if (await requestedBtn.count() === 0) {
      console.log(`❌ [W${workerId}] No request: ${username}`);
      await page.close();
      return;
    }

    await requestedBtn.first().click();
    await randomDelay();

    const unfollowBtn = page.locator('button:has-text("Unfollow")');

    await unfollowBtn.first().waitFor({ timeout: 5000 });
    await unfollowBtn.first().click();

    console.log(`✅ [W${workerId}] Withdrawn: ${username}`);

    await page.close();

  } catch (err) {
    console.log(`⚠️ [W${workerId}] Failed: ${username}`);
    await page.close();
  }
}

async function worker(context, usernames, workerId, indexRef) {
  while (true) {
    const i = indexRef.value++;
    if (i >= usernames.length) return;

    await withdrawRequest(context, usernames[i], workerId);
    await randomDelay();
  }
}

(async () => {
  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    storageState: 'auth.json'
  });

  // 👉 JSON INPUT FILE
  const inputFile = process.argv[2];

  if (!inputFile) {
    console.log("Usage: node script.js <input_json_file>");
    process.exit(1);
  }

  const usernames = extractUsernames(inputFile);

  console.log(`📦 Extracted ${usernames.length} usernames`);

  const indexRef = { value: 0 };

  const workers = [];

  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker(context, usernames, i + 1, indexRef));
  }

  await Promise.all(workers);

  console.log("🎯 Done");
  await browser.close();
})();