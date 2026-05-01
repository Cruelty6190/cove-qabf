# AGENTS.md — cove-qabf

Instructions for Codex CLI and other AI coding agents working in this repository.

---

## Project overview

**cove-qabf** is a QABF (Questions about Behavioral Function) clinical assessment tool for Cove ABA. It is a static web application — plain HTML, CSS, and vanilla JavaScript with no framework. The entire app lives in a single file: `qabf.html`.

Deployment target: Railway (primary) or Vercel (static fallback).  
Live URL (after deploy): `https://qabf.coveaba.com`

---

## File map

```
cove-qabf/
  qabf.html               ← entire app (HTML + CSS + JS, ~530 lines)
  scripts/
    inject-env.js         ← build script: replaces %%TOKEN%% placeholders with env vars
  railway.toml            ← Railway build + deploy config
  vercel.json             ← routes / and /qabf → qabf.html (Vercel fallback)
  package.json            ← npm scripts: build, start, dev
  .env.example            ← template for required environment variables
  .gitignore
  README.md
  AGENTS.md               ← this file
```

---

## Environment setup

```bash
cp .env.example .env
```

Then edit `.env` and fill in real values for all three variables:

```
EMAILJS_PUBLIC_KEY=your_public_key_here
EMAILJS_SERVICE_ID=your_service_id_here
EMAILJS_TEMPLATE_ID=your_template_id_here
```

Get these values from your [EmailJS](https://emailjs.com) account:
- **Public Key** → Account → API Keys
- **Service ID** → Email Services → your connected service
- **Template ID** → Email Templates → your template

---

## Run locally

```bash
# 1. Inject env vars into qabf.html (required before serving)
node scripts/inject-env.js

# 2. Start local dev server
npx serve . -p 3000
# or:
npm run dev

# 3. Open http://localhost:3000 in a browser
```

> `inject-env.js` modifies `qabf.html` in place. Back it up first if needed:
> `cp qabf.html qabf.html.bak`

---

## Build (for deployment)

```bash
npm run build
# equivalent to: node scripts/inject-env.js
```

Railway and Vercel both run this automatically at deploy time using their own environment variable values.

---

## Deploy to Railway

This is the same pattern as the DTT app.

1. Push this repo to GitHub.
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → select `cove-qabf`.
3. Railway auto-detects `railway.toml` and will:
   - Run `node scripts/inject-env.js` as the build command
   - Run `npm start` (which serves the static files on `$PORT`)
4. Add environment variables in Railway → **Variables**:
   ```
   EMAILJS_PUBLIC_KEY     = (your value)
   EMAILJS_SERVICE_ID     = (your value)
   EMAILJS_TEMPLATE_ID    = (your value)
   ```
5. Click **Deploy**. Railway assigns a public URL automatically.
6. For a custom domain (`qabf.coveaba.com`): Railway → **Settings → Domains** → add custom domain → copy the CNAME → add it in Wix DNS.

> Unlike the DTT app, this app has no database and no persistent volume mount needed.

---

## How the build script works

`scripts/inject-env.js` reads `qabf.html`, finds the three placeholder strings, and replaces them with the corresponding environment variable values:

| Placeholder in HTML | Environment variable |
|---------------------|----------------------|
| `%%EMAILJS_PUBLIC_KEY%%` | `EMAILJS_PUBLIC_KEY` |
| `%%EMAILJS_SERVICE_ID%%` | `EMAILJS_SERVICE_ID` |
| `%%EMAILJS_TEMPLATE_ID%%` | `EMAILJS_TEMPLATE_ID` |

This keeps credentials out of source control.

---

## Testing / verification

There is no automated test suite. Manual verification steps:

1. Run `node scripts/inject-env.js` and `npx serve . -p 3000`
2. Open `http://localhost:3000`
3. Fill in all metadata fields (child name, rater name, relationship, date, target behavior)
4. Rate all 25 questions (each accepts: X, 0, 1, 2, or 3)
5. Click **Submit** — the results screen should appear showing:
   - Dominant behavioral function
   - Bar chart with scores for all 5 functions
   - Detailed scores table
6. Email delivery requires real EmailJS credentials in `.env`

---

## App internals

### Behavioral functions and question mapping

The 25 questions map to 5 behavioral functions. Each function is scored by 5 questions (0–3 each), giving a max score of 15 per function.

| Function | Questions |
|----------|-----------|
| Attention | 1, 6, 11, 16, 21 |
| Escape | 2, 7, 12, 17, 22 |
| Non-Social / Sensory | 3, 8, 13, 18, 23 |
| Physical | 4, 9, 14, 19, 24 |
| Tangible | 5, 10, 15, 20, 25 |

The function with the highest score is the **dominant function** and drives the clinical interpretation shown on the results screen.

### EmailJS template variables

| Variable | Contains |
|----------|----------|
| `{{dominant}}` | Dominant function label only (e.g. "Attention") |
| `{{message_body}}` | Full formatted results: all 25 item responses, scores per function, rater comments |

---

## Rules and constraints

Follow these rules for every change made to this codebase:

1. **No hardcoded credentials.** EmailJS keys must stay as `%%TOKEN%%` placeholders in `qabf.html`. Never write actual key values into any source file.

2. **PHI rule.** The email subject line must never contain the child's name, the rater's name, or the target behavior description. It may only reference the dominant function label (e.g. `New QABF Submission — Attention`). This is a clinical privacy requirement.

3. **Single-file app.** Keep all HTML, CSS, and JavaScript in `qabf.html` unless there is a strong structural reason to split. Do not introduce separate `.js` or `.css` files without explicit instruction.

4. **No frameworks.** Do not install React, Vue, Tailwind, or any other framework or library. Keep it vanilla HTML/CSS/JS.

5. **Node >= 18** is required (specified in `package.json` engines).

6. **Do not commit `.env`.** It is listed in `.gitignore`. Only `.env.example` belongs in the repo.
