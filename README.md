# cove-qabf

Cove ABA — QABF (Questions about Behavioral Function) assessment form.  
Deployed as a static site on Vercel. No framework, no database — just HTML + EmailJS.

**Live URL (after deploy):** `https://qabf.coveaba.com`

---

## Project structure

```
cove-qabf/
  qabf.html           ← the entire app (form + results screen)
  vercel.json         ← routes /qabf → qabf.html
  package.json        ← build script entry point
  scripts/
    inject-env.js     ← replaces %%TOKEN%% placeholders with env vars at build time
  .env.example        ← copy to .env for local dev
  .gitignore
  README.md
```

---

## One-time setup: EmailJS

1. Go to https://emailjs.com and create a free account.
2. **Add a service:** Connect → Gmail → name it anything → copy the **Service ID**.
3. **Create a template:**
   - Subject: `New QABF Submission — {{dominant}}`  ← dominant function only, no PHI
   - Body: `{{message_body}}`
   - Copy the **Template ID**.
4. Go to **Account → API Keys** → copy your **Public Key**.
5. You'll need all three values in the next step.

---

## Deploy to Vercel

### Option A — Vercel dashboard (easiest)

1. Push this repo to GitHub:
   ```bash
   cd ~/projects   # or wherever you want it
   git clone <this repo> cove-qabf   # or copy the folder and git init
   cd cove-qabf
   git init && git add . && git commit -m "init"
   # create a new repo on github.com, then:
   git remote add origin https://github.com/YOUR_USERNAME/cove-qabf.git
   git push -u origin main
   ```

2. Go to https://vercel.com → **Add New Project** → import `cove-qabf`.

3. Under **Build & Development Settings:**
   - Framework Preset: **Other**
   - Build Command: `node scripts/inject-env.js`
   - Output Directory: `.` (leave blank or set to `.`)

4. Under **Environment Variables**, add:
   ```
   EMAILJS_PUBLIC_KEY     = (your value)
   EMAILJS_SERVICE_ID     = (your value)
   EMAILJS_TEMPLATE_ID    = (your value)
   ```

5. Click **Deploy**. Done.

---

### Option B — Vercel CLI (from terminal)

```bash
npm i -g vercel
cd ~/projects/cove-qabf
vercel login
vercel env add EMAILJS_PUBLIC_KEY
vercel env add EMAILJS_SERVICE_ID
vercel env add EMAILJS_TEMPLATE_ID
vercel --prod
```

---

## Custom domain (qabf.coveaba.com)

Since coveaba.com is on Wix, you add the DNS record in Wix, not Vercel:

1. In Vercel: **Project → Settings → Domains** → add `qabf.coveaba.com`.
   Vercel will show you a CNAME record, e.g.:
   ```
   CNAME   qabf   cname.vercel-dns.com
   ```

2. In Wix: **Settings → Domains → Manage DNS** → add that CNAME record.

3. Wait 5–30 min for propagation. Vercel auto-provisions the SSL cert.

---

## Local development

```bash
cp .env.example .env
# fill in .env with your EmailJS values

# Inject env vars into a local copy of the HTML
node scripts/inject-env.js

# Serve locally (requires Node)
npx serve . -p 3000
# Open http://localhost:3000
```

> Note: inject-env.js modifies qabf.html in place.
> If you want to preserve the original, copy it first: `cp qabf.html qabf.html.bak`

---

## Claude Code instructions

Open a terminal, navigate to this repo, run `claude`, then paste:

```
I'm working on the cove-qabf project. It's a static HTML site that deploys to Vercel.
The file is qabf.html. The build script is scripts/inject-env.js — it injects environment
variables (EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID) into the HTML
by replacing %%TOKEN%% placeholders before deploy.

[describe what you want to change]
```

Claude Code can: edit the HTML, update the build script, test locally with `npx serve`,
and commit + push for a new Vercel deploy.

---

## Codex (OpenAI) instructions

If using Codex CLI or the Codex web interface:

```
Repository: cove-qabf
Stack: plain HTML/CSS/JS, no framework. Single file: qabf.html.
Build: Node script (scripts/inject-env.js) replaces %%EMAILJS_PUBLIC_KEY%%,
%%EMAILJS_SERVICE_ID%%, %%EMAILJS_TEMPLATE_ID%% with environment variable values
before Vercel deploys the static file.

Task: [describe what you want]

Constraints:
- Do not hardcode any credentials or PHI in qabf.html or any other file.
- Email subject line must never include child name, rater name, or behavior name.
- Keep everything in one HTML file unless there is a strong reason to split it.
```

---

## EmailJS template reference

| Variable        | Contains                          |
|-----------------|-----------------------------------|
| `{{dominant}}`  | Dominant function label only      |
| `{{message_body}}` | Full formatted results (scores + all 25 item responses + rater comments) |

Subject line must only use `{{dominant}}` — no PHI.
