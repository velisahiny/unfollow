# Instagram Requested Follow Withdraw Automation

This project automates withdrawing pending Instagram follow requests using Playwright with Chromium. It opens Instagram profiles from a username list, clicks the **"Requested"** button, and confirms withdrawal by clicking **"Unfollow"** in the popup modal.

---

## ⚠️ Disclaimer

This tool is intended for personal automation purposes only. Use responsibly and ensure compliance with Instagram’s terms of service. Excessive or aggressive usage may lead to temporary account restrictions.

---

## 🚀 Features

- Opens Instagram profiles from a list of usernames
- Detects pending follow requests ("Requested")
- Clicks "Requested" and confirms with "Unfollow" in modal
- Parallel execution using multiple tabs (worker pool)
- Retry mechanism for reliability
- Random delays to reduce detection risk
- Session-based login (no repeated login required after first login)

---

## 📦 Requirements

- Node.js (v16 or higher recommended)
- npm

Install Node.js: https://nodejs.org/

---

## 📥 Installation

```bash
mkdir insta-withdraw
cd insta-withdraw
npm init -y
npm install playwright
npx playwright install
```

---

## 📁 Project Structure

```
insta-withdraw/
│
├── script.js         # Main automation script
├── usernames.txt     # List of Instagram usernames
├── auth.json         # Saved login session (auto-generated after first login)
└── README.md
```

---

## 👤 usernames.txt Format

Add one username per line:

```
user1
user2
user3
```

---

## 🔐 First Time Login

On first run:

1. A Chromium browser will open
2. Instagram login page will appear
3. Log in manually
4. Return to terminal
5. Press ENTER

This will create a session file:

```
auth.json
```

After this, login will be automatic on future runs.

---

## ▶️ Running the Script

```bash
node script.js
```

---

## ⚙️ Configuration

Inside `script.js`, you can adjust performance settings:

```js
const CONCURRENCY = 3;        // number of parallel tabs
const MIN_DELAY = 2000;       // minimum delay (ms)
const MAX_DELAY = 5000;       // maximum delay (ms)
const BATCH_SIZE = 10;        // users per batch before cooldown
const COOLDOWN_MS = 60000;    // cooldown between batches
```

---

## 🧠 How It Works

- Reads usernames from `usernames.txt`
- Opens each profile:
  ```
  https://www.instagram.com/<username>/
  ```
- Checks for "Requested" button
- Clicks it
- Waits for confirmation modal
- Clicks "Unfollow"
- Moves to next user using parallel workers

---

## 🚀 Parallel Execution

The script uses a worker pool system:

- Multiple tabs run in parallel
- Each worker processes usernames independently
- Concurrency is controlled to avoid overloading Instagram
- Random delays simulate human-like behavior

---

## ⚠️ Safety Notes

To reduce risk of blocks:

- Keep concurrency low (2–3 recommended)
- Avoid running continuously for long periods
- Use batch pauses (enabled by default)
- Solve CAPTCHA manually if prompted
- Increase delays if Instagram becomes restrictive

---

## 🛑 Troubleshooting

### Button not found
Instagram UI may change. Update selector:

```js
button:has-text("Requested")
```

### Block / challenge page
If Instagram shows a challenge page, you will need to solve it manually in the browser.

### Script too fast / blocked
Increase delays:

```js
const MIN_DELAY = 4000;
const MAX_DELAY = 8000;
```

Reduce concurrency:

```js
const CONCURRENCY = 2;
```

---

## 📈 Performance Tips

- Use CONCURRENCY = 2 for safest operation
- Run in batches of 100–200 users
- Add VPN if processing large volumes
- Avoid long uninterrupted runs

---

## 📌 Tech Stack

- Node.js
- Playwright
- Chromium automation

---

## 📄 License

For personal use only. Use responsibly.

