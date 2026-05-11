# Instagram Requested Follow Withdraw Automation

This project automates withdrawing pending Instagram follow requests using Playwright with Chromium. It reads usernames directly from a JSON file, extracts them, and immediately processes them in parallel browser workers.

---

## ⚠️ Disclaimer

This tool is intended for personal automation purposes only. Use responsibly and ensure compliance with Instagram’s terms of service. Excessive usage may lead to temporary account restrictions.

---

## 🚀 Features

- Reads usernames directly from a JSON file (no intermediate text file needed)
- Extracts "Username" from nested label structures
- Opens Instagram profiles automatically
- Clicks "Requested" and confirms with "Unfollow"
- Parallel execution with worker pool
- Random delays to reduce detection risk
- Session-based login via auth.json
- Headless background execution supported

---

## 📦 Requirements

- Node.js (v16+ recommended)
- npm
- Playwright

Install Node.js: https://nodejs.org/

---

## 📥 Installation

```bash
npm install
npx playwright install
```

---

## 📁 Input Format (JSON)

Example input file:

```json
[
  {
    "label_values": [
      { "label": "Username", "value": "user1" }
    ]
  }
]
```

---

## 🔐 First Time Login

`

Run a one-time login script (headless disabled):


```bash
node login.js
```


1. Open browser
2. Login to Instagram
3. Press ENTER in terminal
4. Session saved to auth.json

After that, automation runs fully in background.

---

## ▶️ Running the Script

```bash
node script.js input.json
```

---

## ⚙️ Configuration

Inside script:

```js
const CONCURRENCY = 3;
const MIN_DELAY = 2000;
const MAX_DELAY = 5000;
```

---

## 🧠 How It Works

1. Reads JSON file
2. Extracts usernames from "Username" fields
3. Removes duplicates
4. Sends usernames to worker pool
5. Each worker:
   - Opens profile
   - Clicks "Requested"
   - Waits for modal
   - Clicks "Unfollow"
   - Moves to next user

---

## 🚀 Parallel Execution

- Uses multiple workers (tabs)
- Controlled concurrency
- Shared index pointer for workload distribution
- Random delays between actions

---

## ⚠️ Safety Notes

- Keep concurrency low (2–3 recommended)
- Add delays if Instagram becomes restrictive
- Solve CAPTCHA manually if prompted
- Avoid long continuous runs

---

## 🛑 Troubleshooting

### Block / challenge page
Solve manually in browser if prompted.

### Button not found
Instagram UI may change. Update selector:

```js
button:has-text("Requested")
```

---

## 📈 Performance Tips

- Use CONCURRENCY = 2 for safer execution
- Run in batches for large datasets
- Optionally use VPN for stability

---

## 📌 Tech Stack

- Node.js
- Playwright
- Chromium automation

---

## 📄 License

For personal use only.
