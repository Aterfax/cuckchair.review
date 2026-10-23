#!/usr/bin/env node
'use strict';
// One-off generator for the cuckguessr placeholder scene images.
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public/assets/cuckguessr');
fs.mkdirSync(dir, { recursive: true });

// Dark armchair silhouette motif shared by every scene.
const chair = `
  <g transform="translate(158,118)">
    <rect x="8" y="-26" width="76" height="52" rx="16" fill="#16233f"/>
    <rect x="-6" y="0" width="18" height="46" rx="7" fill="#1c2c4f"/>
    <rect x="80" y="0" width="18" height="46" rx="7" fill="#1c2c4f"/>
    <rect x="6" y="24" width="80" height="20" rx="6" fill="#20335c"/>
    <rect x="12" y="44" width="10" height="16" fill="#0d1526"/>
    <rect x="70" y="44" width="10" height="16" fill="#0d1526"/>
  </g>`;

const frame = `<rect x="40" y="24" width="320" height="150" fill="<FILL>" stroke="#2a3757"/>`;

const scenes = {
  skyline: {
    from: '#0b1026',
    to: '#1b2450',
    content:
      `<rect x="40" y="24" width="320" height="150" fill="rgba(10,14,34,0.55)" stroke="#2a3757"/>` +
      `<rect x="66" y="84" width="34" height="90" fill="#243563"/>` +
      `<rect x="110" y="60" width="42" height="114" fill="#2c3f74"/>` +
      `<rect x="162" y="92" width="30" height="82" fill="#243563"/>` +
      `<rect x="202" y="70" width="48" height="104" fill="#31457c"/>` +
      `<rect x="260" y="100" width="30" height="74" fill="#243563"/>` +
      `<rect x="296" y="84" width="40" height="90" fill="#2c3f74"/>` +
      Array.from({ length: 14 }, (_, i) => {
        const x = 50 + ((i * 61) % 300);
        const y = 34 + ((i * 37) % 40);
        return `<circle cx="${x}" cy="${y}" r="1.6" fill="#9db4ff" opacity="0.8"/>`;
      }).join('') +
      chair,
  },
  lakeside: {
    from: '#0e1e33',
    to: '#1c3350',
    content:
      `<rect x="40" y="24" width="320" height="150" fill="rgba(8,20,40,0.35)" stroke="#2a3757"/>` +
      `<path d="M40 120 Q120 58 200 96 T360 104 L360 174 L40 174 Z" fill="#1a2c4e"/>` +
      `<rect x="40" y="128" width="320" height="46" fill="#17335e"/>` +
      `<path d="M60 138 Q130 130 200 140 T340 138" stroke="#4f7fb8" fill="none" stroke-width="3" opacity="0.6"/>` +
      `<path d="M60 152 Q140 146 220 154 T340 150" stroke="#4f7fb8" fill="none" stroke-width="2" opacity="0.4"/>` +
      chair,
  },
  cabin: {
    from: '#071f2a',
    to: '#0e3a4a',
    content:
      `<rect x="40" y="24" width="320" height="150" fill="rgba(6,26,38,0.35)" stroke="#24505e"/>` +
      `<circle cx="200" cy="96" r="52" fill="#0b2f42" stroke="#2a5568" stroke-width="5"/>` +
      `<path d="M156 106 Q200 88 244 106" stroke="#3fc1ac" fill="none" stroke-width="3" opacity="0.7"/>` +
      `<path d="M160 116 Q200 100 240 116" stroke="#3fc1ac" fill="none" stroke-width="2" opacity="0.5"/>` +
      `<path d="M40 182 L360 182" stroke="#234c5c" stroke-width="4"/>` +
      `<g transform="translate(370,146) rotate(0)"><rect x="-120" y="-4" width="240" height="8" fill="#123242"/></g>` +
      chair,
  },
  desert: {
    from: '#241c30',
    to: '#4b2e52',
    content:
      `<rect x="40" y="24" width="320" height="150" fill="rgba(60,38,66,0.35)" stroke="#3c2e4e"/>` +
      `<path d="M40 132 Q160 102 360 140 L360 174 L40 174 Z" fill="#5c3f5e"/>` +
      `<path d="M342 112 v-26 M330 104 v-14 M342 100 v14" stroke="#c58b9f" stroke-width="4" fill="none" stroke-linecap="round"/>` +
      `<rect x="52" y="44" width="54" height="26" rx="13" fill="#e45f8a" opacity="0.85"/>` +
      `<text x="79" y="62" text-anchor="middle" font-size="12" fill="#1b1026" font-family="sans-serif">POOL</text>` +
      chair,
  },
  studio: {
    from: '#1d1030',
    to: '#38173c',
    content:
      `<rect x="40" y="24" width="320" height="150" fill="rgba(52,20,60,0.4)" stroke="#43204e"/>` +
      `<rect x="70" y="52" width="86" height="122" rx="8" fill="#241040" stroke="#552961"/>` +
      `<circle cx="113" cy="98" r="22" fill="#0d0619" stroke="#7b3f8a" stroke-width="4"/>` +
      `<path d="M200 60 q30 24 0 48 q-30 24 0 48" stroke="#8a4b96" fill="none" stroke-width="5" stroke-linecap="round"/>` +
      `<rect x="240" y="122" width="110" height="40" rx="6" fill="#2c1240" stroke="#552961"/>` +
      chair,
  },
  chalet: {
    from: '#14181f',
    to: '#2a3743',
    content:
      `<rect x="40" y="24" width="320" height="150" fill="rgba(20,26,38,0.4)" stroke="#334155"/>` +
      `<path d="M40 148 L140 64 L232 148 Z" fill="#314254"/>` +
      `<path d="M196 102 L258 56 L340 148 L200 148 Z" fill="#3b4f63"/>` +
      `<path d="M96 88 L140 64 L186 88" stroke="#63dcd2" stroke-width="4" opacity="0.55" fill="none"/>` +
      `<rect x="150" y="64" width="76" height="12" rx="4" fill="#2b3b4c" transform="rotate(8 188 70)"/>` +
      chair,
  },
};

for (const [name, s] of Object.entries(scenes)) {
  const svg = `<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder scene">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${s.from}"/>
      <stop offset="1" stop-color="${s.to}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="260" fill="url(#bg)"/>
  ${s.content}
</svg>
`;
  fs.writeFileSync(path.join(dir, `${name}.svg`), svg);
  console.log('wrote', name + '.svg', svg.length, 'bytes');
}
