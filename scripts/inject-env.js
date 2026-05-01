#!/usr/bin/env node
/**
 * inject-env.js
 * Runs at Vercel build time. Replaces %%TOKEN%% placeholders in qabf.html
 * with actual environment variable values so secrets never live in source.
 *
 * Vercel calls:  node scripts/inject-env.js
 */
const fs   = require('fs');
const path = require('path');

const file    = path.join(__dirname, '..', 'qabf.html');
let   content = fs.readFileSync(file, 'utf8');

const vars = {
  '%%EMAILJS_PUBLIC_KEY%%':  process.env.EMAILJS_PUBLIC_KEY  || '',
  '%%EMAILJS_SERVICE_ID%%':  process.env.EMAILJS_SERVICE_ID  || '',
  '%%EMAILJS_TEMPLATE_ID%%': process.env.EMAILJS_TEMPLATE_ID || '',
};

for (const [token, value] of Object.entries(vars)) {
  if (!value) {
    console.warn(`WARNING: env var for token ${token} is not set.`);
  }
  content = content.replaceAll(token, value);
}

fs.writeFileSync(file, content, 'utf8');
console.log('inject-env: done.');
