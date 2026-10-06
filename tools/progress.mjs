// Renders the build-progress cards and the README sections from roadmap.json.
//
//   node tools/progress.mjs           write docs/progress/*.svg and update README.md
//   node tools/progress.mjs --check   exit 1 if anything is out of date
//
// Outputs (light and dark variants, picked by <picture> in the README):
//   docs/progress/progress-{light,dark}.svg   full card: metrics, milestones, stats
//   docs/progress/compact-{light,dark}.svg    two bars, for the profile README
// README sections between <!-- name:start --> and <!-- name:end --> markers are
// regenerated as plain Markdown, so the numbers read without the images too:
//   progress   the two tracks and the module list behind the first one
//   phases     the security programme, phase by phase
//   roadmap    milestones, shipped and next
//
// Colours are the Sole Hand palette only: black, cream and six greens. One hue,
// several values: every gradient goes from one green to another.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'roadmap.json'), 'utf8'));

// ---- palette -----------------------------------------------------------------
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (fg, bg, a) => '#' + hex(fg).map((c, i) => Math.round(c * a + hex(bg)[i] * (1 - a)).toString(16).padStart(2, '0')).join('').toUpperCase();
function theme(bg, ink, accent, grad) {
  return {
    bg, ink, accent, grad,
    soft: mix(ink, bg, 0.8), mute: mix(ink, bg, 0.62),
    line: mix(ink, bg, 0.16), track: mix(ink, bg, 0.1), chip: mix(ink, bg, 0.055),
    node: ink, nodeInk: bg,
  };
}
const CREAM = '#F5F1EB', NIGHT = '#081C15';
const THEMES = {
  light: theme(CREAM, NIGHT, '#2D6A4F', ['#1B4332', '#40916C']),
  dark: theme(NIGHT, CREAM, '#74C69D', ['#40916C', '#74C69D']),
};
const FONT = "Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const SERIF = "'Instrument Serif', Georgia, 'Times New Roman', serif";
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Consolas, monospace";

// ---- helpers -----------------------------------------------------------------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtMonth = d => /^\d{4}-\d{2}$/.test(d) ? `${MONTHS[+d.slice(5) - 1]} ${d.slice(0, 4)}` : d[0].toUpperCase() + d.slice(1);
const fmtDay = d => { const [y, m, dd] = d.split('-'); return `${+dd} ${MONTHS[+m - 1]} ${y}`; };

// The first track can be counted straight from the module list, so the bar and
// the table under it can never disagree.
const metrics = data.metrics.map(m => m.fromModules
  ? { ...m, done: data.modules.filter(x => x.status === 'live').length, total: data.modules.length }
  : m);
const pct = m => Math.round((m.done / m.total) * 100);

// Rough text width for Inter at a given size, enough to size a pill.
const textWidth = (s, size) => [...s].reduce((w, ch) => w + (/[mwMW]/.test(ch) ? 0.82 : /[il.,'· ]/.test(ch) ? 0.3 : /[A-Z]/.test(ch) ? 0.66 : 0.56), 0) * size;

function defs(id, t) {
  return `<defs><linearGradient id="g${id}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${t.grad[0]}"/><stop offset="1" stop-color="${t.grad[1]}"/></linearGradient>` +
    `<pattern id="h${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="${t.track}"/><rect width="2.4" height="6" fill="${t.grad[1]}" opacity=".55"/></pattern></defs>`;
}

function bar(m, x, y, w, t, id, compact) {
  const p = pct(m);
  const h = compact ? 10 : 12;
  let s = `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${compact ? 13 : 14}" font-weight="600" fill="${t.ink}">${esc(m.label)}</text>`;
  s += `<text x="${x + w}" y="${y}" text-anchor="end" font-family="${MONO}" font-size="${compact ? 12 : 13}" fill="${t.soft}">${m.done} / ${m.total} ${esc(m.unit)} · <tspan font-weight="700" fill="${t.ink}">${p}%</tspan></text>`;
  const by = y + 12;
  if (m.segmented) {
    const gap = 4, seg = (w - gap * (m.total - 1)) / m.total;
    for (let i = 0; i < m.total; i++) {
      const sx = x + i * (seg + gap);
      const fill = i < m.done ? `url(#g${id})` : i === m.done ? `url(#h${id})` : t.track;
      s += `<rect x="${sx.toFixed(2)}" y="${by}" width="${seg.toFixed(2)}" height="${h}" rx="${h / 2}" fill="${fill}"/>`;
      if (!compact && m.segments) {
        s += `<text x="${(sx + seg / 2).toFixed(2)}" y="${by + h + 17}" text-anchor="middle" font-family="${FONT}" font-size="11" fill="${i < m.done ? t.soft : t.mute}">${i + 1} · ${esc(m.segments[i])}</text>`;
      }
    }
    if (!compact && m.note) s += `<text x="${x}" y="${by + h + 38}" font-family="${FONT}" font-size="12" fill="${t.mute}">${esc(m.note)}</text>`;
  } else {
    s += `<rect x="${x}" y="${by}" width="${w}" height="${h}" rx="${h / 2}" fill="${t.track}"/>`;
    s += `<rect x="${x}" y="${by}" width="${Math.max(h, (w * p) / 100).toFixed(1)}" height="${h}" rx="${h / 2}" fill="url(#g${id})"/>`;
    if (!compact && m.note) s += `<text x="${x}" y="${by + h + 18}" font-family="${FONT}" font-size="12" fill="${t.mute}">${esc(m.note)}</text>`;
  }
  return s;
}

function fullCard(t, id) {
  const W = 960, pad = 40, inner = W - pad * 2;
  const ms = data.milestones, r = data.release;
  let y = 0, body = '';
  body += `<text x="${pad}" y="52" font-family="${FONT}" font-size="11" letter-spacing="2.2" fill="${t.mute}">${esc(data.product.toUpperCase())} · BUILD PROGRESS</text>`;
  // Headline: one italic serif word, the house style for titles.
  body += `<text x="${pad}" y="90" font-family="${FONT}" font-size="30" font-weight="700" letter-spacing="-0.5" fill="${t.ink}">${esc(r.label)} <tspan font-family="${SERIF}" font-style="italic" font-weight="400" font-size="34" letter-spacing="0" fill="${t.accent}">${esc(r.status)}</tspan></text>`;
  body += `<text x="${pad}" y="114" font-family="${FONT}" font-size="13" fill="${t.mute}">${esc(r.site)} live since ${fmtDay(r.since)} · updated ${fmtDay(data.updated)}</text>`;
  // badge: what comes next
  const label = `Next · ${r.next}`;
  const bw = Math.round(textWidth(label, 13) + 58), bx = W - pad - bw;
  body += `<rect x="${bx}" y="58" width="${bw}" height="34" rx="17" fill="none" stroke="url(#g${id})" stroke-width="1.6"/>`;
  body += `<circle cx="${bx + 20}" cy="75" r="4.5" fill="${t.accent}"><animate attributeName="opacity" values="1;.35;1" dur="2.4s" repeatCount="indefinite"/></circle>`;
  body += `<text x="${bx + 34}" y="80" font-family="${FONT}" font-size="13" font-weight="600" fill="${t.ink}">${esc(label)}</text>`;
  y = 162;
  for (const m of metrics) { body += bar(m, pad, y, inner, t, id, false); y += m.segmented ? 96 : 78; }
  // milestones
  y += 12;
  body += `<text x="${pad}" y="${y}" font-family="${FONT}" font-size="11" letter-spacing="2.2" fill="${t.mute}">MILESTONES</text>`;
  const ly = y + 42, step = inner / (ms.length - 1);
  const lastDone = ms.map(m => m.status).lastIndexOf('done');
  body += `<line x1="${pad}" y1="${ly}" x2="${pad + inner}" y2="${ly}" stroke="${t.line}" stroke-width="2"/>`;
  body += `<line x1="${pad}" y1="${ly}" x2="${pad + step * lastDone}" y2="${ly}" stroke="url(#g${id})" stroke-width="3"/>`;
  ms.forEach((m, i) => {
    const cx = pad + step * i;
    const anchor = i === 0 ? 'start' : i === ms.length - 1 ? 'end' : 'middle';
    const tx = i === 0 ? cx - 9 : i === ms.length - 1 ? cx + 9 : cx;
    body += `<text x="${tx}" y="${ly - 20}" text-anchor="${anchor}" font-family="${MONO}" font-size="11" fill="${t.mute}">${esc(fmtMonth(m.date))}</text>`;
    if (m.status === 'done') {
      body += `<circle cx="${cx}" cy="${ly}" r="9" fill="${t.node}"/><path d="M${cx - 4} ${ly} l2.8 2.8 l5.2 -5.4" fill="none" stroke="${t.nodeInk}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else if (m.status === 'active') {
      body += `<circle cx="${cx}" cy="${ly}" r="9" fill="${t.bg}" stroke="url(#g${id})" stroke-width="2.4"/><circle cx="${cx}" cy="${ly}" r="3.5" fill="${t.accent}"><animate attributeName="r" values="3.5;5;3.5" dur="2.4s" repeatCount="indefinite"/></circle>`;
    } else {
      body += `<circle cx="${cx}" cy="${ly}" r="8" fill="${t.bg}" stroke="${t.line}" stroke-width="2" stroke-dasharray="3 3"/>`;
    }
    const [l1, l2] = m.title.split(' · ');
    body += `<text x="${tx}" y="${ly + 30}" text-anchor="${anchor}" font-family="${FONT}" font-size="12" font-weight="600" fill="${m.status === 'planned' ? t.mute : t.ink}">${esc(l1)}</text>`;
    if (l2) body += `<text x="${tx}" y="${ly + 46}" text-anchor="${anchor}" font-family="${FONT}" font-size="11.5" fill="${t.mute}">${esc(l2)}</text>`;
  });
  // stats, four per row
  const perRow = 4, gap = 10, cw = (inner - gap * (perRow - 1)) / perRow, ch = 58;
  const sy = ly + 76;
  data.stats.forEach((s, i) => {
    const sx = pad + (i % perRow) * (cw + gap), yy = sy + Math.floor(i / perRow) * (ch + gap);
    body += `<rect x="${sx.toFixed(1)}" y="${yy}" width="${cw.toFixed(1)}" height="${ch}" rx="12" fill="${t.chip}"/>`;
    body += `<text x="${(sx + 14).toFixed(1)}" y="${yy + 27}" font-family="${FONT}" font-size="20" font-weight="700" fill="${t.ink}">${esc(s.value)}</text>`;
    body += `<text x="${(sx + 14).toFixed(1)}" y="${yy + 45}" font-family="${FONT}" font-size="11" fill="${t.mute}">${esc(s.label)}</text>`;
  });
  const rows = Math.ceil(data.stats.length / perRow);
  const H = sy + rows * ch + (rows - 1) * gap + pad;
  return svg(W, H, t, id, body, `${data.product} build progress`);
}

function compactCard(t, id) {
  const W = 840, pad = 28, inner = W - pad * 2, r = data.release;
  let body = `<text x="${pad}" y="40" font-family="${FONT}" font-size="15" font-weight="700" fill="${t.ink}">${esc(data.product)} <tspan font-weight="400" fill="${t.mute}">· ${esc(r.label.toLowerCase())} ${esc(r.status)} · updated ${fmtDay(data.updated)}</tspan></text>`;
  let y = 78;
  for (const m of metrics) { body += bar(m, pad, y, inner, t, id, true); y += 50; }
  return svg(W, y - 6, t, id, body, `${data.product} build progress`);
}

function svg(W, H, t, id, body, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${defs(id, t)}` +
    `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="20" fill="${t.bg}" stroke="${t.line}"/>${body}</svg>\n`;
}

// ---- README sections -----------------------------------------------------------
function progressMd() {
  const rows = metrics.map(m => `| ${m.label} | ${m.done} / ${m.total} ${m.unit} | **${pct(m)}%** |`).join('\n');
  const label = { live: 'Live', built: 'Built, not switched on', building: 'In progress', planned: 'Planned' };
  const mods = data.modules.map(m => `| ${m.name} | ${label[m.status]} | ${m.detail} |`).join('\n');
  const first = metrics.find(m => m.fromModules);
  return `_Last updated ${fmtDay(data.updated)} · ${data.release.site} live since ${fmtDay(data.release.since)}._\n\n| Track | Progress | |\n|---|---|---|\n${rows}\n\n` +
    `<details>\n<summary>The ${first.total} modules behind the first bar</summary>\n\n| Module | Status | What it covers |\n|---|---|---|\n${mods}\n\n</details>`;
}
function phasesMd() {
  const label = { done: 'Deployed', active: 'Rolling out', planned: 'Planned' };
  return '| Phase | Scope | Status | What it puts in place |\n|---|---|---|---|\n' +
    data.phases.map((p, i) => `| ${i + 1} | ${p.title} | ${label[p.status]} | ${p.detail} |`).join('\n');
}
function roadmapMd() {
  const label = { done: 'Done', active: 'In progress', planned: 'Planned' };
  return '| When | Milestone | Status | What shipped, or what comes next |\n|---|---|---|---|\n' +
    data.milestones.map(m => `| ${fmtMonth(m.date)} | ${m.title} | ${label[m.status]} | ${m.detail} |`).join('\n');
}

const outputs = {
  'docs/progress/progress-light.svg': fullCard(THEMES.light, 'L'),
  'docs/progress/progress-dark.svg': fullCard(THEMES.dark, 'D'),
  'docs/progress/compact-light.svg': compactCard(THEMES.light, 'l'),
  'docs/progress/compact-dark.svg': compactCard(THEMES.dark, 'd'),
};
const lf = s => s.replace(/\r\n/g, '\n');
const readmePath = path.join(ROOT, 'README.md');
if (fs.existsSync(readmePath)) {
  // Line endings are normalised so a CRLF checkout on Windows does not look stale.
  let r = lf(fs.readFileSync(readmePath, 'utf8'));
  const put = (name, md) => { r = r.replace(new RegExp(`(<!-- ${name}:start -->)[\\s\\S]*?(<!-- ${name}:end -->)`), (_, a, b) => `${a}\n${md}\n${b}`); };
  put('progress', progressMd());
  put('phases', phasesMd());
  put('roadmap', roadmapMd());
  outputs['README.md'] = r;
}

let stale = 0;
for (const [rel, content] of Object.entries(outputs)) {
  const p = path.join(ROOT, rel);
  const cur = fs.existsSync(p) ? lf(fs.readFileSync(p, 'utf8')) : null;
  if (cur === content) continue;
  stale++;
  if (!CHECK) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, content); console.log('updated', rel); }
  else console.log('out of date:', rel);
}
if (CHECK) process.exit(stale ? 1 : 0);
if (!stale) console.log('progress: everything up to date');
