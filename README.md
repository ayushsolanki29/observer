# Observer

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ayushsolanki29/observer/)

Observer is a lightweight, generic open-source website monitoring engine. It checks target websites periodically and sends you Telegram notifications when new content matches your criteria.

Designed to be fully configurable without writing any code, you simply create JSON monitor configurations.

## Features
- **Configurable**: Define what to watch via simple JSON files.
- **Generic Matcher**: Create powerful matching rules (`mustMatch`, `shouldMatch`, `mustNotMatch`).
- **Telegram Notifications**: Get batched alerts straight to your phone.
- **Lightweight Storage**: Saves history in simple JSON. No database required.

## 🚀 Setup & Installation

Observer can be run on your local computer or deployed to a Virtual Private Server (VPS). 

> **Important Note regarding GitHub Actions**: Many university and government websites (such as GTU) block requests originating from Cloud/Datacenter IP addresses (like GitHub Actions). For these websites, it is highly recommended to run Observer on your local PC or a VPS rather than using a CI/CD pipeline.

### Method 1: Local PC Setup (Windows / macOS / Linux)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ayushsolanki29/observer.git
   cd observer
   ```

2. **Install dependencies and build:**
   ```bash
   npm install
   npm run build
   ```

3. **Configure Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and add your Telegram Bot Token and Chat ID:
   ```env
   TELEGRAM_BOT_TOKEN="your_bot_token_here"
   TELEGRAM_CHAT_ID="your_chat_id_here"
   ```

4. **Run the Monitor:**
   ```bash
   npm run start
   ```

### Method 2: VPS Setup (Background Execution)

Running Observer on a VPS allows it to check for updates 24/7.

1. **Clone and setup the project** exactly as described in the Local PC steps above.

2. **Setup a Cron Job:**
   Instead of running it manually, configure your server to run it automatically on a schedule (e.g., every 6 hours).
   
   Open the cron editor:
   ```bash
   crontab -e
   ```
   
   Add the following line to the bottom (assuming you cloned it into your home directory `~/observer`):
   ```bash
   0 */6 * * * cd ~/observer && npm run start >> ~/observer/cron.log 2>&1
   ```
   *This runs the monitor every 6 hours and saves any logs to `cron.log`.*

## ⚙️ Creating a Monitor

To monitor a new website or category, create a JSON file inside the `/monitors` directory (e.g., `monitors/gtu-mca.json`):

```json
{
  "version": 1,
  "id": "gtu-mca",
  "name": "GTU MCA",
  "enabled": true,
  "website": {
    "url": "https://www.gtu.ac.in/",
    "parser": "GtuParser"
  },
  "notifications": {
    "telegram": true
  },
  "matching": {
    "mustMatch": ["MCA"],
    "shouldMatch": [
      { "keyword": "Result", "score": 5 }
    ],
    "mustNotMatch": ["Civil", "Mechanical"],
    "minimumScore": 5
  }
}
```

## 🧠 How Observer Works

```text
Monitor → Fetcher → Parser → Matcher → Storage → Notifier
```

- **Monitor**: The configuration JSON file.
- **Fetcher**: Downloads the website HTML.
- **Parser**: Extracts notices from the raw HTML into a standard format.
- **Matcher**: Evaluates the notices against your configured rules.
- **Storage**: Keeps track of processed notices in `data/storage.json` to prevent duplicate alerts.
- **Notifier**: Sends batched updates via Telegram.

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how you can help make Observer better.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
