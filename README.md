# R6-Bot

## ⚙️ Run & Update the Bot (Raspberry Pi / PM2)

### ▶️ Start the bot (first time)

```bash
pm2 start dist/index.js --name r6-bot
```

---

### 🔁 Restart the bot

```bash
pm2 restart r6-bot
```

---

### 🔄 Restart with updated environment variables

```bash
pm2 restart r6-bot --update-env
```

---

### 🛑 Stop the bot

```bash
pm2 stop r6-bot
```

---

### ❌ Remove the bot from PM2

```bash
pm2 delete r6-bot
```

---

### 📊 Check bot status

```bash
pm2 status
```

---

### 📜 View logs

```bash
pm2 logs r6-bot
```

Last 50 lines only:

```bash
pm2 logs r6-bot --lines 50
```

---

## 🔄 Update the Bot (after pushing changes)

```bash
cd ~/R6-bot
git pull
npm install
npm run build
pm2 restart r6-bot
```

---

### ⚡ Quick update (one command)

```bash
cd ~/R6-bot && git pull && npm install && npm run build && pm2 restart r6-bot
```

---

## 🧪 Register Slash Commands

After adding or modifying commands:

```bash
node dist/scripts/register-commands.js
pm2 restart r6-bot
```

---

## 🧪 Run in Debug Mode (without PM2)

```bash
node dist/index.js
```

Or with TypeScript:

```bash
npx ts-node src/index.ts
```

---

## 💾 Save PM2 configuration (auto start on reboot)

```bash
pm2 save
pm2 startup
```

---

## 🔥 Full reset (if something is broken)

```bash
pm2 delete r6-bot
cd ~/R6-bot
git pull
npm install
npm run build
pm2 start dist/index.js --name r6-bot
pm2 save
```

---

## 🧠 Most useful commands

```bash
pm2 logs r6-bot
pm2 restart r6-bot
git pull
```

---

## 💻 Run the Bot Locally

### 📦 Install dependencies

```bash
npm install
```

---

### ⚙️ Setup environment variables

Create a `.env` file at the root of the project:

```env
BOT_TOKEN=your_discord_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
R6DATA_API_KEY=your_api_key
```

---

### 🧪 Register slash commands (local guild)

```bash
node dist/scripts/register-commands.js
```

> If using TypeScript directly:

```bash
npx ts-node scripts/register-commands.ts
```

---

### ▶️ Run the bot

#### If using compiled JavaScript

```bash
npm run build
node dist/index.js
```

#### If using TypeScript directly

```bash
npx ts-node src/index.ts
```

---

### 🔄 Development mode (auto reload)

If you want auto-restart on file changes:

```bash
npx ts-node-dev src/index.ts
```

> Install if needed:

```bash
npm install --save-dev ts-node-dev
```

---

### 🧪 Debug tips

- Check logs directly in terminal
- Add `console.log()` where needed
- Make sure:
  - Bot is invited to your server
  - Bot has **Manage Roles** permission
  - Roles are below the bot role

---

### ⚠️ Common issues

#### ❌ Commands not appearing

```bash
node dist/scripts/register-commands.js
```

---

#### ❌ API errors (401 / 500)

- Verify your `R6DATA_API_KEY`
- Check API status
- Some users may not have stats

---

#### ❌ Roles not updating

- Ensure bot role is above rank roles
- Check role names match your mapping
