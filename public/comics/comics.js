/* My Comics — collection, grading and selling manager. Plain JS, no build step. */
(() => {
  'use strict';

  // ---------- constants ----------
  const BASE_CSV = '/comics/data/collection.csv';
  const BASE_DATE = '2026-11-08';
  const COVER_FILES = ['/comics/data/covers-1.json', '/comics/data/covers-2.json'];
  const API = '/api/comics';
  const STATUSES = [
    ['', 'Unsorted'], ['keep', 'Keep'], ['sell', 'Sell raw'], ['grade', 'To grade'], ['submitted', 'At grader'],
    ['graded', 'Graded'], ['listed', 'Listed'], ['sold', 'Sold'], ['lot', 'In a lot'],
  ];
  const STATUS_LABEL = Object.fromEntries(STATUSES);
  const PIPELINE = ['sell', 'grade', 'submitted', 'graded', 'listed', 'lot', 'sold', 'keep'];
  const DEFAULT_PREFS = { feePct: 13.25, perSaleFee: 0.4, shipCost: 5, gradeCost: 50, candMin: 100, candMajorMin: 50, lotMax: 10, lotMinCount: 5 };
  const SECTIONS = [['browse', 'Browse the collection'], ['selling', 'Selling'], ['grading', 'Grading shortlist'], ['valuable', 'Most valuable comics'], ['lots', 'Lots to sell together'], ['value', 'Collection value'], ['boxes', 'Storage boxes']];

  // ---------- small helpers ----------
  const $ = (id) => document.getElementById(id);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const fmt = new Intl.NumberFormat('en-US');
  const money = (v, dp = 0) => v == null || isNaN(v) ? '—' : (v < 0 ? '−$' : '$') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const num = (x) => { if (x === '' || x == null) return null; const n = +String(x).replace(/[$,]/g, ''); return isNaN(n) ? null : n; };
  const h = (tag, attrs, ...kids) => {
    const e = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (k === 'dataset') Object.assign(e.dataset, v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) e.append(kid instanceof Node ? kid : String(kid));
    return e;
  };
  const icon = (name) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('class', 'ic'); const u = document.createElementNS('http://www.w3.org/2000/svg', 'use'); u.setAttribute('href', '#i-' + name); s.append(u); return s; };
  const ls = { get(k, d) { try { const v = localStorage.getItem('mc.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } }, set(k, v) { try { localStorage.setItem('mc.' + k, JSON.stringify(v)); } catch {} } };
  let toastT;
  const toast = (msg) => { const t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600); };
  const dateStr = (ms) => new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // ---------- CSV ----------
  function parseCSV(text) {
    const rows = []; let row = [], f = '', q = false;
    text = text.replace(/^﻿/, '');
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
      else f += c;
    }
    if (f !== '' || row.length) { row.push(f); rows.push(row); }
    const head = rows.shift() || [];
    return { head, rows: rows.filter((r) => r.length > 1 || (r[0] || '').trim()) };
  }
  const csvCell = (v) => { const s = v == null ? '' : String(v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  function download(name, text, type = 'text/csv') {
    const a = h('a', { href: URL.createObjectURL(new Blob([text], { type })), download: name }); document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // Turns a CLZ export into comics. Each copy gets a stable key: its CLZ comic ID (or series + issue) plus copy number.
  function buildComics(csvText) {
    const { head, rows } = parseCSV(csvText);
    const ix = (name) => head.findIndex((x) => x.trim().toLowerCase() === name.toLowerCase());
    const col = { series: ix('Series'), issue: ix('Issue'), title: ix('Full Title'), date: ix('Release Date'), pub: ix('Publisher'), age: ix('Age'), key: ix('Key'), grade: ix('Grade'), box: ix('Storage Box'), writer: ix('Writer'), artist: ix('Cover Artist'), chars: ix('Characters'), value: ix('Value'), covr: ix('CovrPrice Value'), coverPrice: ix('Cover Price'), cid: ix('Core ComicID'), slab: ix('Raw / Slabbed') };
    if (col.series < 0) throw new Error('This file has no Series column. Export from CLZ Comics Web as CSV with the Series and Issue fields.');
    const g = (r, k) => (col[k] >= 0 ? (r[col[k]] || '').trim() : '');
    const seen = new Map();
    const list = rows.map((r) => {
      const series = g(r, 'series'), issue = g(r, 'issue'), cid = g(r, 'cid');
      const base = cid && cid !== '0' ? 'c' + cid : 'm' + series + '|' + issue;
      const n = (seen.get(base) || 0) + 1; seen.set(base, n);
      const c = {
        key: base + '#' + n, cid: cid && cid !== '0' ? cid : '', series, issue,
        comic: series + (issue ? ' #' + issue : ''), title: g(r, 'title'), year: (g(r, 'date').match(/\d{4}/) || [''])[0],
        publisher: g(r, 'pub') || 'Unknown', age: g(r, 'age') || 'Unknown', ki: g(r, 'key') || 'No', grade: g(r, 'grade'), box: g(r, 'box'),
        writer: g(r, 'writer'), artist: g(r, 'artist'), chars: g(r, 'chars'), v: num(g(r, 'value')), cp: num(g(r, 'covr')), coverPrice: num(g(r, 'coverPrice')), slab: g(r, 'slab'),
      };
      c.hay = `${c.comic} ${c.title} ${c.publisher} ${c.year} ${c.chars} ${c.writer} ${c.artist}`.toLowerCase();
      return c;
    });
    return { list, hasCid: col.cid >= 0, hasValue: col.value >= 0 };
  }

  // ---------- state ----------
  let comics = [], byKey = new Map(), covers = new Map();
  let state = { items: {}, prefs: { ...DEFAULT_PREFS } };
  let history = [];
  let source = { kind: 'base', at: Date.parse(BASE_DATE + 'T12:00:00'), name: 'CLZ export' };
  let editKey = ls.get('editKey', '');
  let unlocked = false;
  const ui = {
    q: '', fKey: '', fStatus: '*', fBox: '*', fPub: '', fAge: '', fVal: '', fCover: '', sort: 'value',
    view: ls.get('view', 'covers'), page: ls.get('page', 60), shown: ls.get('page', 60), topN: 100,
    selecting: false, selected: new Set(), stage: null, ctx: [], ctxIndex: 0,
  };
  const prefs = () => ({ ...DEFAULT_PREFS, ...(state.prefs || {}) });
  const item = (k) => state.items[k] || {};
  const status = (c) => item(c.key).status || '';
  const coverOf = (c) => (c.cid && covers.get(c.cid)) || null;

  // ---------- money math ----------
  const feeOn = (price) => price * prefs().feePct / 100 + prefs().perSaleFee;
  const netRaw = (c) => c.v == null ? null : c.v - feeOn(c.v) - prefs().shipCost;
  const netGraded = (gv) => gv == null ? null : gv - feeOn(gv) - prefs().shipCost - prefs().gradeCost;
  // Graded sale price at which grading nets the same as selling raw.
  const breakEven = (c) => { if (c.v == null) return null; const p = prefs(); return (netRaw(c) + p.shipCost + p.gradeCost + p.perSaleFee) / (1 - p.feePct / 100); };
  const isCand = (c) => { const p = prefs(); if (status(c) === 'sold') return false; return (c.v ?? 0) >= p.candMin || (c.ki === 'Major' && (c.v ?? 0) >= p.candMajorMin); };
  const soldNet = (it) => { const sp = num(it.soldPrice); if (sp == null) return null; const fees = num(it.soldFees) ?? feeOn(sp); return sp - fees - (num(it.shipCost) ?? 0) - (num(it.gradeCost) ?? 0); };

  // ---------- persistence ----------
  let saveT, saving = false;
  function setSync(cls, text) { const s = $('sync'); s.hidden = false; s.className = 'sync ' + cls; $('syncText').textContent = text; }
  function saveState() {
    ls.set('state', state);
    if (!unlocked) return;
    clearTimeout(saveT);
    setSync('busy', 'Saving…');
    saveT = setTimeout(async () => {
      saving = true;
      try {
        const r = await fetch(API, { method: 'PUT', headers: { 'content-type': 'application/json', 'x-comics-key': editKey }, body: JSON.stringify({ kind: 'state', data: state }) });
        if (r.status === 401) { lock('Your edit key no longer works. Enter it again in Settings → Editing.'); return; }
        if (!r.ok) throw new Error();
        setSync('ok', 'Saved');
      } catch { setSync('err', 'Not saved — offline?'); }
      finally { saving = false; }
    }, 700);
  }
  function setItem(k, patch) {
    const cur = { ...item(k), ...patch, updated: Date.now() };
    for (const f of Object.keys(cur)) if (cur[f] === '' || cur[f] == null) delete cur[f];
    if (Object.keys(cur).length <= 1) delete state.items[k]; else state.items[k] = cur;
    saveState();
  }
  async function checkKey(key) {
    try { const r = await fetch(API, { method: 'PUT', headers: { 'content-type': 'application/json', 'x-comics-key': key }, body: '{"kind":"check"}' }); return r.ok; } catch { return false; }
  }
  function applyLock() {
    $$('.edit-only').forEach((e) => { e.hidden = !unlocked; });
    if (unlocked) setSync('ok', 'Editing on'); else setSync('', 'View only');
  }
  function lock(msg) { unlocked = false; applyLock(); if (msg) toast(msg); renderAll(); }

  // ---------- derived ----------
  let ranked = [];
  function derive() {
    ranked = comics.slice().sort((a, b) => (b.v ?? -1) - (a.v ?? -1) || a.comic.localeCompare(b.comic));
    ranked.forEach((c, i) => { c.rank = i + 1; });
    byKey = new Map(comics.map((c) => [c.key, c]));
  }
  function group(list, keyFn, labelFn) {
    const m = new Map();
    for (const c of list) { const k = keyFn(c); const g = m.get(k) || { key: k, label: labelFn ? labelFn(k) : k, comics: 0, value: 0, list: [] }; g.comics++; g.value += c.v ?? 0; g.list.push(c); m.set(k, g); }
    return [...m.values()];
  }

  // ---------- rendering pieces ----------
  function coverEl(c, cls = 'img') {
    const img = coverOf(c);
    if (img) return h('img', { class: cls, loading: 'lazy', alt: c.comic, src: 'data:image/jpeg;base64,' + img });
    return h('div', { class: cls === 'img' ? 'none' : cls + ' none' }, cls === 'img' ? (covers.size ? 'No cover' : '') : '');
  }
  const thumb = (c) => coverOf(c) ? h('img', { class: 'thumb', loading: 'lazy', alt: '', src: 'data:image/jpeg;base64,' + coverOf(c) }) : h('div', { class: 'thumb none' });
  const keyPill = (k) => (k === 'Major' || k === 'Minor') ? h('span', { class: 'kp ' + k.toLowerCase(), text: k }) : h('span', { class: 'muted', text: '–' });
  const statusPill = (s) => s ? h('span', { class: 'st st-' + s, text: STATUS_LABEL[s] }) : h('span', { class: 'muted', text: '–' });

  function bars(target, rows, color, onClick) {
    target.replaceChildren();
    const max = Math.max(1, ...rows.map((r) => r.value));
    for (const r of rows) {
      target.append(h('div', { class: 'bar-row' + (onClick ? ' click' : ''), onclick: onClick ? () => onClick(r) : null },
        h('div', { class: 'name', title: r.label, text: r.label }),
        h('div', { class: 'bar-track' }, h('div', { class: 'bar', style: `width:calc((100% - 8rem) * ${r.value / max});background:${color}` }), h('div', { class: 'bar-val' }, money(r.value) + ' ', h('span', { text: '· ' + fmt.format(r.comics) })))));
    }
  }

  // ---------- filters ----------
  function matches() {
    const terms = ui.q.split(/\s+/).filter(Boolean);
    let list = comics.filter((c) => {
      if (ui.fKey === 'key' && c.ki === 'No') return false;
      if (ui.fKey && ui.fKey !== 'key' && c.ki !== ui.fKey) return false;
      if (ui.fStatus !== '*' && status(c) !== ui.fStatus) return false;
      if (ui.fBox !== '*' && c.box !== ui.fBox) return false;
      if (ui.fPub && c.publisher !== ui.fPub) return false;
      if (ui.fAge && c.age !== ui.fAge) return false;
      if (ui.fVal === 'none' && c.v != null) return false;
      if (ui.fVal === 'lt10' && !(c.v != null && c.v < 10)) return false;
      if (ui.fVal && !isNaN(+ui.fVal) && !((c.v ?? -1) >= +ui.fVal)) return false;
      if (ui.fCover === 'no' && coverOf(c)) return false;
      return !terms.length || terms.every((t) => c.hay.includes(t));
    });
    const by = {
      value: (a, b) => a.rank - b.rank, 'value-asc': (a, b) => (a.v ?? Infinity) - (b.v ?? Infinity) || a.rank - b.rank,
      title: (a, b) => a.series.localeCompare(b.series) || (parseFloat(a.issue) || 0) - (parseFloat(b.issue) || 0) || a.issue.localeCompare(b.issue),
      'year-old': (a, b) => (a.year || '9999').localeCompare(b.year || '9999') || a.rank - b.rank, 'year-new': (a, b) => (b.year || '0').localeCompare(a.year || '0') || a.rank - b.rank,
      box: (a, b) => ((+a.box || 9999) - (+b.box || 9999)) || a.series.localeCompare(b.series) || (parseFloat(a.issue) || 0) - (parseFloat(b.issue) || 0),
      updated: (a, b) => (item(b.key).updated || 0) - (item(a.key).updated || 0) || a.rank - b.rank,
    };
    return list.sort(by[ui.sort] || by.value);
  }
  function filterCount() { return ['fKey', 'fPub', 'fAge', 'fVal', 'fCover'].filter((k) => ui[k]).length + (ui.fStatus !== '*') + (ui.fBox !== '*'); }

  // ---------- sections ----------
  function renderHeader() {
    const owned = ranked.filter((c) => status(c) !== 'sold'), soldCount = comics.length - owned.length;
    const vals = owned.map((c) => c.v ?? 0);
    const total = vals.reduce((a, b) => a + b, 0), top100 = vals.slice(0, 100).reduce((a, b) => a + b, 0);
    const cands = comics.filter(isCand), unvalued = comics.filter((c) => c.v == null).length;
    const sold = comics.filter((c) => status(c) === 'sold'), soldNetSum = sold.reduce((a, c) => a + (soldNet(item(c.key)) ?? 0), 0);
    const active = comics.filter((c) => ['sell', 'grade', 'submitted', 'graded', 'listed', 'lot'].includes(status(c))).length;
    $('asOf').textContent = `Values as of ${dateStr(source.at)} · ${source.kind === 'base' ? 'CLZ export' : source.name}`;
    $('t-value').textContent = money(total);
    const covrTotal = owned.reduce((a, c) => a + (c.cp ?? 0), 0);
    $('t-value-sub').textContent = `CovrPrice ${money(covrTotal)}` + (soldCount ? ` · excl. ${fmt.format(soldCount)} sold` : '');
    $('t-count').textContent = fmt.format(owned.length);
    $('t-count-sub').textContent = `${fmt.format(new Set(comics.map((c) => c.series)).size)} series · ${fmt.format(new Set(comics.map((c) => c.box).filter(Boolean)).size)} boxes`;
    $('t-top100').textContent = money(top100);
    $('t-top100-sub').textContent = `${Math.round(top100 / (total || 1) * 100)}% of the collection`;
    $('t-cands').textContent = fmt.format(cands.length);
    $('t-cands-sub').textContent = `${money(cands.reduce((a, c) => a + (c.v ?? 0), 0))} raw value`;
    $('t-sell').textContent = sold.length ? money(soldNetSum) : fmt.format(active);
    $('t-sell-sub').textContent = sold.length ? `Net from ${fmt.format(sold.length)} sold · ${fmt.format(active)} in progress` : (active ? 'Comics in progress' : 'Nothing marked to sell yet');
    $('t-unvalued').textContent = fmt.format(unvalued);
    const lede = $('lede'); lede.replaceChildren('Your collection is worth ', h('b', { text: money(total) }), ' at CLZ values. The top 100 comics hold ', h('b', { text: Math.round(top100 / (total || 1) * 100) + '%' }), ' of that, and ', h('b', { text: fmt.format(cands.length) }), ' are worth a grading review.');
    $('foot').textContent = `${fmt.format(comics.length)} comics · values from ${source.kind === 'base' ? 'the CLZ export of ' + dateStr(source.at) : source.name + ', imported ' + dateStr(source.at)} · covers from the CLZ report of Nov 8, 2026 · icons: Lucide`;
  }

  function cvCard(c, i, list) {
    const s = status(c), sel = ui.selected.has(c.key);
    const card = h('button', { class: 'cv' + (sel ? ' sel' : ''), type: 'button', onclick: () => {
      if (ui.selecting) { if (ui.selected.has(c.key)) ui.selected.delete(c.key); else ui.selected.add(c.key); card.classList.toggle('sel'); updateBulk(); }
      else openDetail(c, list, i);
    } },
      coverEl(c),
      h('div', { class: 'badges' }, ui.selecting ? h('span', { class: 'pick' }, sel ? icon('check') : null) : (c.ki !== 'No' ? h('span', { class: 'kp ' + c.ki.toLowerCase(), text: c.ki }) : h('span')), s ? h('span', { class: 'st st-' + s, text: STATUS_LABEL[s] }) : null),
      h('div', { class: 't', title: c.comic, text: c.comic }),
      h('div', { class: 'm' }, h('b', { text: money(c.v) }), h('span', { text: c.box ? 'Box ' + c.box : '' })));
    return card;
  }
  function row(c, list, i, cells) { const tr = h('tr', { onclick: () => openDetail(c, list, i) }); tr.append(...cells.map((x) => x instanceof Node && x.tagName === 'TD' ? x : h('td', null, x))); return tr; }
  const td = (x, cls) => h('td', { class: cls }, x);

  function renderBrowse() {
    const all = matches();
    const tv = all.reduce((a, c) => a + (c.v ?? 0), 0);
    $('browseMeta').textContent = `${fmt.format(all.length)} comics · ${money(tv)}`;
    $('filterCount').textContent = filterCount() ? ` (${filterCount()})` : '';
    $('filterBtn').classList.toggle('on', !!filterCount());
    $('viewCovers').hidden = ui.view !== 'covers'; $('viewList').hidden = ui.view !== 'list';
    $$('[data-view]').forEach((b) => b.classList.toggle('on', b.dataset.view === ui.view));
    if (ui.view === 'covers') {
      const g = $('gallery'); g.replaceChildren();
      all.slice(0, ui.shown).forEach((c, i) => g.append(cvCard(c, i, all)));
      if (!all.length) g.append(h('div', { class: 'empty', text: 'No comics match. Try clearing a filter.' }));
      $('more').hidden = all.length <= ui.shown;
      $('more').textContent = `Show more (${fmt.format(all.length - ui.shown)} left)`;
    } else {
      const lim = Math.max(ui.shown, 300);
      $('list').replaceChildren(...all.slice(0, lim).map((c, i) => row(c, all, i, [td(c.rank, 'r num'), td(thumb(c)), td(c.comic), td(c.year, 'hide-n'), td(keyPill(c.ki)), td(statusPill(status(c)), 'hide-n'), td(money(c.v), 'r num'), td(money(c.cp), 'r num hide-n'), td(c.box || '–', 'r')])));
      $('listNote').textContent = all.length > lim ? `Showing ${fmt.format(lim)} of ${fmt.format(all.length)}. Narrow the search or download the CSV for everything.` : '';
    }
  }

  function renderSelling() {
    const mine = comics.filter((c) => status(c));
    const by = (s) => mine.filter((c) => status(c) === s);
    const sold = by('sold'), listed = by('listed');
    const gross = sold.reduce((a, c) => a + (num(item(c.key).soldPrice) ?? 0), 0);
    const net = sold.reduce((a, c) => a + (soldNet(item(c.key)) ?? 0), 0);
    const clzSold = sold.reduce((a, c) => a + (c.v ?? 0), 0);
    const asking = listed.reduce((a, c) => a + (num(item(c.key).ask) ?? c.v ?? 0), 0);
    const pipeline = mine.filter((c) => !['sold', 'keep'].includes(status(c)));
    $('sellMeta').textContent = mine.length ? `${fmt.format(pipeline.length)} in progress · ${fmt.format(sold.length)} sold` : 'Nothing marked yet';
    const t = $('sellTotals'); t.replaceChildren(
      h('div', null, h('span', { text: 'In progress (CLZ value)' }), h('b', { class: 'num', text: money(pipeline.reduce((a, c) => a + (c.v ?? 0), 0)) })),
      h('div', null, h('span', { text: 'Listed (asking)' }), h('b', { class: 'num', text: money(asking) })),
      h('div', null, h('span', { text: 'Sold (gross)' }), h('b', { class: 'num', text: money(gross) })),
      h('div', null, h('span', { text: 'Sold (net after costs)' }), h('b', { class: 'num', text: money(net) })),
      h('div', null, h('span', { text: 'Net vs CLZ value' }), h('b', { class: 'num ' + (net - clzSold >= 0 ? 'up' : 'down'), text: sold.length ? (net - clzSold >= 0 ? '+' : '') + money(net - clzSold) : '—' })));
    const chips = $('stageChips'); chips.replaceChildren();
    for (const s of PIPELINE) {
      const l = by(s); const v = s === 'sold' ? l.reduce((a, c) => a + (num(item(c.key).soldPrice) ?? 0), 0) : l.reduce((a, c) => a + (c.v ?? 0), 0);
      chips.append(h('button', { class: 'chip' + (ui.stage === s ? ' on' : ''), type: 'button', onclick: () => { ui.stage = ui.stage === s ? null : s; renderSelling(); } }, h('span', { class: 'st st-' + s, text: STATUS_LABEL[s] }), h('b', { class: 'num', text: fmt.format(l.length) }), h('span', { class: 'muted num', text: money(v) })));
    }
    const box = $('stageList'); box.replaceChildren();
    if (!mine.length) {
      box.append(h('div', { class: 'empty' }, unlocked ? 'Open any comic and set its status — Keep, Sell raw, To grade, and so on — or use Select in Browse to set many at once. Good places to start: the grading shortlist and the lots list.' : 'Nothing is marked for sale yet. To start, turn on editing in Settings → Editing.'));
      return;
    }
    const list = (ui.stage ? by(ui.stage) : pipeline.length ? pipeline : mine).sort((a, b) => (item(b.key).updated || 0) - (item(a.key).updated || 0));
    box.append(h('p', { class: 'note', text: ui.stage ? `${STATUS_LABEL[ui.stage]}: ${fmt.format(list.length)} comics` : 'In progress, most recently updated first' }));
    const isSold = ui.stage === 'sold';
    box.append(h('div', { class: 'tbl-wrap' }, h('table', null,
      h('thead', null, h('tr', null, h('th'), h('th', { text: 'Comic' }), h('th', { text: 'Status' }), h('th', { class: 'r', text: 'CLZ value' }), h('th', { class: 'r', text: isSold ? 'Sold for' : 'Asking / graded est.' }), h('th', { class: 'r hide-n', text: isSold ? 'Net' : 'Est. net' }), h('th', { class: 'hide-n', text: 'Notes' }), h('th', { class: 'r', text: 'Box' }))),
      h('tbody', null, list.map((c, i) => { const it = item(c.key); const s = status(c);
        const est = s === 'sold' ? soldNet(it) : num(it.ask) != null ? netRaw({ v: num(it.ask) }) : num(it.gradedValue) != null ? netGraded(num(it.gradedValue)) : netRaw(c);
        return row(c, list, i, [td(thumb(c)), td(c.comic), td(statusPill(s)), td(money(c.v), 'r num'), td(money(s === 'sold' ? num(it.soldPrice) : num(it.ask) ?? num(it.gradedValue)), 'r num'), td(money(est), 'r num hide-n'), td(h('span', { class: 'muted', text: [it.gradedGrade ? 'CGC ' + it.gradedGrade : '', it.listedOn || '', it.notes || ''].filter(Boolean).join(' · ').slice(0, 60) }), 'hide-n'), td(c.box || '–', 'r')]); })))));
    box.append(h('div', { class: 'inline' }, h('button', { class: 'btn', type: 'button', onclick: () => exportCSV(list, `comics-${ui.stage || 'selling'}.csv`) }, icon('download'), 'Download this list'), h('button', { class: 'btn', type: 'button', onclick: () => pullList(list) }, icon('print'), 'Pull list by box')));
  }

  function renderGrading() {
    const p = prefs();
    const list = comics.filter(isCand).sort((a, b) => a.rank - b.rank);
    $('gradeMeta').textContent = `${fmt.format(list.length)} comics · ${money(list.reduce((a, c) => a + (c.v ?? 0), 0))}`;
    $('gradeNote').textContent = `Comics worth ${money(p.candMin)}+, or major keys worth ${money(p.candMajorMin)}+. “Graded sale needed” is the slabbed price at which grading nets you the same as selling raw, after ${p.feePct}% selling fees, ${money(p.shipCost)} shipping and ${money(p.gradeCost)} per book to grade. Add your own graded estimate on a comic (from CovrPrice or eBay sold listings) to get a verdict. Check condition first: a raw 8.0 rarely gains enough from a slab.`;
    $('cands').replaceChildren(...list.map((c, i) => {
      const gv = num(item(c.key).gradedValue), be = breakEven(c);
      const verdict = gv == null ? h('span', { class: 'muted', text: 'Add estimate' }) : gv > be ? h('span', { class: 'better-grade', text: 'Grade' }) : h('span', { class: 'better-raw', text: 'Sell raw' });
      return row(c, list, i, [td(thumb(c)), td(h('div', null, c.comic, ' ', c.ki !== 'No' ? keyPill(c.ki) : null, ' ', status(c) ? statusPill(status(c)) : null)), td(money(c.v), 'r num'), td(money(netRaw(c)), 'r num hide-n'), td(money(be), 'r num'), td(money(gv), 'r num hide-n'), td(verdict, 'c'), td(c.box || '–', 'r')]);
    }));
  }

  function renderTop() {
    const list = ranked.slice(0, ui.topN);
    $('topMeta').textContent = `Top ${ui.topN} · ${money(list.reduce((a, c) => a + (c.v ?? 0), 0))}`;
    $$('[data-top]').forEach((b) => b.classList.toggle('on', +b.dataset.top === ui.topN));
    $('top').replaceChildren(...list.map((c, i) => row(c, list, i, [td(c.rank, 'r num'), td(thumb(c)), td(c.comic), td(c.year, 'hide-n'), td(keyPill(c.ki)), td(statusPill(status(c)), 'hide-n'), td(money(c.v), 'r num'), td(money(c.cp), 'r num hide-n'), td(c.box || '–', 'r')])));
  }

  function renderLots() {
    const p = prefs();
    const pool = comics.filter((c) => (c.v ?? 0) < p.lotMax && !['sold', 'keep', 'grade', 'submitted', 'graded'].includes(status(c)));
    const groups = group(pool, (c) => c.series).filter((g) => g.comics >= p.lotMinCount).sort((a, b) => b.comics - a.comics || b.value - a.value);
    $('lotMeta').textContent = `${fmt.format(groups.length)} series · ${fmt.format(groups.reduce((a, g) => a + g.comics, 0))} comics`;
    $('lotNote').textContent = `Comics under ${money(p.lotMax)} each rarely pay for their own listing fees and shipping, but they sell well as runs. These series have ${p.lotMinCount}+ such comics. Tap a series to see its covers.`;
    $('lots').replaceChildren(...groups.slice(0, 80).map((g) => {
      const yrs = g.list.map((c) => c.year).filter(Boolean).sort();
      const boxes = [...new Set(g.list.map((c) => c.box).filter(Boolean))].sort((a, b) => a - b);
      const allLot = g.list.every((c) => status(c) === 'lot');
      return h('tr', { onclick: () => { resetFilters(); ui.q = g.key.toLowerCase(); ui.fVal = 'lt10'; syncFilterInputs(); go('browse'); renderBrowse(); } },
        td(g.key), td(fmt.format(g.comics), 'r num'), td(money(g.value), 'r num'), td(yrs.length ? (yrs[0] === yrs[yrs.length - 1] ? yrs[0] : yrs[0] + '–' + yrs[yrs.length - 1]) : '–', 'r hide-n'), td(boxes.slice(0, 6).join(', ') + (boxes.length > 6 ? '…' : ''), 'hide-n'),
        unlocked ? td(h('button', { class: 'btn' + (allLot ? ' on' : ''), type: 'button', onclick: (e) => { e.stopPropagation(); g.list.forEach((c) => setItem(c.key, { status: allLot ? '' : 'lot' })); toast(allLot ? 'Removed from lots' : `${g.comics} comics marked as a lot`); renderAll(); } }, allLot ? 'In a lot ✓' : 'Mark as lot')) : null);
    }));
  }

  function renderValue() {
    const total = comics.reduce((a, c) => a + (c.v ?? 0), 0);
    $('valueMeta').textContent = money(total);
    const bandDefs = [['$100 or more', 100, Infinity, '100'], ['$50 to $99', 50, 100, '50'], ['$25 to $49', 25, 50, '25'], ['$10 to $24', 10, 25, '10'], ['Under $10', 0, 10, 'lt10']];
    const bandRows = bandDefs.map(([label, lo, hi, f]) => { const r = comics.filter((c) => c.v != null && c.v >= lo && c.v < hi); return { label, f, comics: r.length, value: r.reduce((a, c) => a + c.v, 0) }; });
    bandRows.push({ label: 'No value', f: 'none', comics: comics.filter((c) => c.v == null).length, value: 0 });
    bars($('bands'), bandRows, 'var(--gold)', (r) => { resetFilters(); ui.fVal = r.f; syncFilterInputs(); go('browse'); renderBrowse(); });
    bars($('pubs'), group(comics, (c) => c.publisher).sort((a, b) => b.value - a.value).slice(0, 6), 'var(--accent)', (r) => { resetFilters(); ui.fPub = r.key; syncFilterInputs(); go('browse'); renderBrowse(); });
    bars($('ages'), group(comics, (c) => c.age).sort((a, b) => b.value - a.value), 'var(--accent-2)', (r) => { resetFilters(); ui.fAge = r.key; syncFilterInputs(); go('browse'); renderBrowse(); });
    renderHistory(total);
  }

  function renderHistory(total) {
    const pts = (history.length ? history : [{ at: source.at, total }]).map((p) => ({ at: p.at, total: p.total }));
    const el = $('history'); el.replaceChildren();
    const W = 560, H = 160, L = 54, R = 14, T = 12, B = 24;
    const xs = pts.map((p) => p.at), ys = pts.map((p) => p.total);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys) * 0.95, y1 = Math.max(...ys) * 1.05 || 1;
    const sx = (x) => x1 === x0 ? (L + W - R) / 2 : L + (x - x0) / (x1 - x0) * (W - L - R);
    const sy = (y) => T + (1 - (y - y0) / ((y1 - y0) || 1)) * (H - T - B);
    const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Collection value over time');
    const add = (tag, a, text) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (text != null) e.textContent = text; svg.append(e); return e; };
    for (const y of [y0, (y0 + y1) / 2, y1]) { add('line', { x1: L, x2: W - R, y1: sy(y), y2: sy(y), stroke: 'var(--line)' }); add('text', { x: L - 6, y: sy(y) + 4, 'text-anchor': 'end', 'font-size': 11, fill: 'var(--muted)' }, money(y)); }
    if (pts.length > 1) add('polyline', { points: pts.map((p) => `${sx(p.at)},${sy(p.total)}`).join(' '), fill: 'none', stroke: 'var(--gold)', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
    pts.forEach((p) => { const c = add('circle', { cx: sx(p.at), cy: sy(p.total), r: 4, fill: 'var(--gold)' }); const tt = document.createElementNS(NS, 'title'); tt.textContent = `${dateStr(p.at)}: ${money(p.total)}`; c.append(tt); });
    add('text', { x: sx(pts[0].at), y: H - 6, 'text-anchor': pts.length > 1 ? 'start' : 'middle', 'font-size': 11, fill: 'var(--muted)' }, dateStr(pts[0].at));
    if (pts.length > 1) add('text', { x: sx(pts[pts.length - 1].at), y: H - 6, 'text-anchor': 'end', 'font-size': 11, fill: 'var(--muted)' }, dateStr(pts[pts.length - 1].at));
    el.append(svg);
    $('historyNote').textContent = pts.length > 1 ? `${pts.length} snapshots. Each new CLZ export you load adds one.` : 'One snapshot so far. Each time you load a new CLZ export (Settings → Update values), a point is added here.';
  }

  function renderBoxes() {
    const rows = group(comics, (c) => c.box, (k) => k ? 'Box ' + k : 'No box').sort((a, b) => b.value - a.value);
    $('boxMeta').textContent = `${fmt.format(rows.filter((r) => r.key).length)} boxes`;
    bars($('boxbars'), rows, 'var(--up)', (r) => { resetFilters(); ui.fBox = r.key; ui.sort = 'value'; ui.view = 'covers'; syncFilterInputs(); go('browse'); renderBrowse(); });
  }

  // ---------- tile summaries ----------
  const strip = (list) => h('div', { class: 'strip' }, list.slice(0, 5).map((c) => coverOf(c) ? h('img', { alt: c.comic, loading: 'lazy', src: 'data:image/jpeg;base64,' + coverOf(c) }) : h('div', { class: 'none' })));
  const big = (...k) => h('div', { class: 'big' }, ...k);
  const line = (...k) => h('div', { class: 'line' }, ...k);
  const B = (x) => h('b', { class: 'num', text: x });
  function sum(k, pill, pillCls, kids, foot) {
    const p = $('pill-' + k); p.textContent = pill || ''; p.className = 'pill' + (pillCls ? ' ' + pillCls : '');
    $('sum-' + k).replaceChildren(...kids.filter(Boolean), h('div', { class: 'foot2' }, h('span', { text: foot || '' }), h('span', { class: 'open-hint', text: 'Open ›' })));
  }
  function renderSummaries() {
    const owned = ranked.filter((c) => status(c) !== 'sold');
    const total = owned.reduce((a, c) => a + (c.v ?? 0), 0), covr = owned.reduce((a, c) => a + (c.cp ?? 0), 0);
    const series = new Set(owned.map((c) => c.series)).size, boxes = group(owned, (c) => c.box).filter((g) => g.key);
    sum('browse', fmt.format(owned.length), '', [big(B(money(total)), ' CLZ value'), line(fmt.format(series), ' series · ', fmt.format(boxes.length), ' boxes · ', B(money(covr)), ' CovrPrice'), strip(owned)],
      `Covers or list · search, filter, sort`);
    const mine = comics.filter((c) => status(c)), prog = mine.filter((c) => !['sold', 'keep'].includes(status(c))), sold = mine.filter((c) => status(c) === 'sold');
    const net = sold.reduce((a, c) => a + (soldNet(item(c.key)) ?? 0), 0), listed = mine.filter((c) => status(c) === 'listed');
    sum('selling', sold.length ? `${fmt.format(sold.length)} sold` : prog.length ? `${fmt.format(prog.length)} active` : 'Not started', sold.length ? 'good' : prog.length ? '' : 'warn',
      mine.length ? [big(B(fmt.format(prog.length)), ' in progress · ', B(money(prog.reduce((a, c) => a + (c.v ?? 0), 0))), ' CLZ value'), line(fmt.format(listed.length), ' listed · ', fmt.format(sold.length), ' sold · net ', B(money(net))), strip(prog.length ? prog : sold)]
        : [big('Nothing marked yet'), line(unlocked ? 'Open a comic and set its status to start tracking.' : 'Turn on editing in Settings to start tracking.')],
      'Status, prices and sales for each comic');
    const cands = owned.filter(isCand), est = cands.filter((c) => num(item(c.key).gradedValue) != null), yes = est.filter((c) => num(item(c.key).gradedValue) > breakEven(c));
    sum('grading', `${fmt.format(cands.length)} comics`, '', [big(B(money(cands.reduce((a, c) => a + (c.v ?? 0), 0))), ' raw value'), line(est.length ? [fmt.format(est.length), ' estimated · ', B(fmt.format(yes.length)), ' worth grading'] : 'Add graded estimates to see which to slab'), strip(cands)],
      `Over ${money(prefs().candMin)}, or major keys over ${money(prefs().candMajorMin)}`);
    const top = owned.slice(0, 100), t100 = top.reduce((a, c) => a + (c.v ?? 0), 0);
    sum('valuable', `Top ${fmt.format(Math.min(100, owned.length))}`, '', [big(B(money(t100)), ` · ${Math.round(t100 / (total || 1) * 100)}% of value`), top[0] ? line('#1 ', B(top[0].comic), ' · ', money(top[0].v)) : null, strip(top)], 'Top 25, 50 and 100');
    const p = prefs(), pool = comics.filter((c) => (c.v ?? 0) < p.lotMax && !['sold', 'keep', 'grade', 'submitted', 'graded'].includes(status(c)));
    const lots = group(pool, (c) => c.series).filter((g) => g.comics >= p.lotMinCount).sort((a, b) => b.comics - a.comics);
    sum('lots', `${fmt.format(lots.length)} series`, '', [big(B(fmt.format(lots.reduce((a, g) => a + g.comics, 0))), ` comics under ${money(p.lotMax)}`), lots[0] ? line('Biggest run: ', B(lots[0].key), ` (${lots[0].comics})`) : null, lots[0] ? strip(lots[0].list) : null], 'Low-value runs to sell together');
    const hi = owned.filter((c) => (c.v ?? 0) >= 100), none = owned.filter((c) => c.v == null).length;
    const last = history.length ? history[history.length - 1] : null;
    sum('value', money(total), '', [big(B(fmt.format(hi.length)), ' comics at $100+ hold ', B(money(hi.reduce((a, c) => a + c.v, 0)))), line(fmt.format(none), ' without a value · ', history.length ? `${history.length} snapshots, last ${dateStr(last.at)}` : `as of ${dateStr(source.at)}`)],
      'Price bands, publishers, eras, history');
    const bs = boxes.sort((a, b) => b.value - a.value), nobox = owned.filter((c) => !c.box).length;
    sum('boxes', `${fmt.format(boxes.length)} boxes`, '', [bs[0] ? big('Top: ', B('Box ' + bs[0].key), ' · ', money(bs[0].value), ` · ${fmt.format(bs[0].comics)} comics`) : null, line(fmt.format(nobox), ' comics with no box'), bs[0] ? strip(bs[0].list.sort((a, b) => (b.v ?? 0) - (a.v ?? 0))) : null], 'Value and covers by box');
  }

  function renderAll() { derive(); renderHeader(); renderBrowse(); renderSelling(); renderGrading(); renderTop(); renderLots(); renderValue(); renderBoxes(); renderSummaries(); applySections(); }

  // ---------- detail sheet ----------
  function searchQuery(c) {
    const series = c.series.replace(/,?\s*Vol\.?\s*\d+$/i, '').replace(/^The\s+/i, '');
    const issue = (c.issue.match(/^\d+/) || [c.issue])[0];
    return `${series} ${issue}${c.year ? ' ' + c.year : ''}`.trim();
  }
  function openDetail(c, list, i) {
    ui.ctx = list || [c]; ui.ctxIndex = list ? i : 0;
    drawDetail(c);
    $('modal').hidden = false; document.body.style.overflow = 'hidden';
  }
  function closeDetail() { $('modal').hidden = true; document.body.style.overflow = ''; }
  function stepDetail(d) { const n = ui.ctx.length; if (n < 2) return; ui.ctxIndex = (ui.ctxIndex + d + n) % n; drawDetail(ui.ctx[ui.ctxIndex]); }
  function drawDetail(c) {
    const it = item(c.key), p = prefs();
    $('mTitle').textContent = c.comic;
    $('mPrev').disabled = $('mNext').disabled = ui.ctx.length < 2;
    const body = $('mBody'); body.replaceChildren();
    const dl = h('dl');
    const add = (k, v) => { if (v) dl.append(h('dt', { text: k }), h('dd', null, v)); };
    add('Rank', `#${fmt.format(c.rank)} of ${fmt.format(comics.length)}`);
    add('Story', c.title); add('Year', c.year); add('Publisher', c.publisher); add('Era', c.age !== 'Unknown' ? c.age : '');
    add('Key issue', c.ki !== 'No' ? keyPill(c.ki) : '');
    add('CLZ value', c.v != null ? money(c.v) : 'No value'); add('CovrPrice', c.cp != null ? money(c.cp) : ''); add('Cover price', c.coverPrice != null ? money(c.coverPrice, 2) : '');
    add('Condition', c.grade || (c.slab || 'Raw')); add('Box', c.box ? 'Box ' + c.box : 'No box');
    add('Status', status(c) ? statusPill(status(c)) : '');
    add('Writer', c.writer.replaceAll(' | ', ', ')); add('Cover artist', c.artist.replaceAll(' | ', ', '));
    add('Characters', c.chars.split(' | ').slice(0, 10).join(', '));
    const q = encodeURIComponent(searchQuery(c));
    const links = h('div', { class: 'links' },
      h('a', { class: 'btn', href: `https://www.ebay.com/sch/i.html?_nkw=${q}&LH_Sold=1&LH_Complete=1`, target: '_blank', rel: 'noopener' }, icon('external'), 'eBay sold'),
      h('a', { class: 'btn', href: `https://www.ebay.com/sch/i.html?_nkw=${q}`, target: '_blank', rel: 'noopener' }, icon('external'), 'eBay for sale'),
      h('a', { class: 'btn', href: `https://www.google.com/search?q=${encodeURIComponent('site:covrprice.com ' + searchQuery(c))}`, target: '_blank', rel: 'noopener' }, icon('external'), 'CovrPrice'),
      h('a', { class: 'btn', href: `https://www.google.com/search?q=${encodeURIComponent('site:gocollect.com ' + searchQuery(c))}`, target: '_blank', rel: 'noopener' }, icon('external'), 'GoCollect'));

    // net calculator
    const gv = num(it.gradedValue);
    const calc = h('div', { class: 'calc' });
    const r = (k, v, cls) => h('div', { class: 'row' }, h('span', { class: 'muted', text: k }), h('b', { class: 'num ' + (cls || ''), text: v }));
    if (c.v != null) {
      calc.append(h('div', { class: 'sub-h', text: 'Sell raw or grade?' }),
        r(`Net selling raw at ${money(c.v)}`, money(netRaw(c))),
        r('Graded sale needed to beat raw', money(breakEven(c))),
        gv != null ? r(`Net if graded and sold at ${money(gv)}`, money(netGraded(gv))) : null,
        h('div', { class: 'verdict ' + (gv == null ? 'muted' : gv > breakEven(c) ? 'better-grade' : 'better-raw'), text: gv == null ? 'Add a graded estimate below to compare.' : gv > breakEven(c) ? `Grading comes out ahead by ${money(netGraded(gv) - netRaw(c))}.` : `Selling raw comes out ahead by ${money(netRaw(c) - netGraded(gv))}.` }),
        h('div', { class: 'muted', style: 'font-size:12px;margin-top:4px', text: `Assumes ${p.feePct}% + ${money(p.perSaleFee, 2)} selling fees, ${money(p.shipCost)} shipping, ${money(p.gradeCost)} to grade. Change these in Settings → Selling.` }));
    } else calc.append(h('div', { class: 'muted', text: 'No value in CLZ for this comic. Check eBay sold listings above for a price.' }));
    if (status(c) === 'sold' && num(it.soldPrice) != null) calc.append(r('Your net on this sale', money(soldNet(it)), 'up'));

    const right = h('div', null, dl, links, calc);
    if (unlocked) {
      const field = (label, k, type = 'text', attrs = {}) => h('label', { class: attrs.wide ? 'wide' : null }, label,
        type === 'textarea' ? h('textarea', { oninput: (e) => setItem(c.key, { [k]: e.target.value }) }, it[k] || '')
          : h('input', { type, value: it[k] ?? '', inputmode: type === 'number' ? 'decimal' : null, step: type === 'number' ? '0.01' : null, placeholder: attrs.ph || '', onchange: (e) => { setItem(c.key, { [k]: e.target.value }); renderAll(); drawDetail(c); } }));
      const sel = h('select', { onchange: (e) => { const patch = { status: e.target.value }; if (e.target.value === 'sold' && !it.soldDate) patch.soldDate = new Date().toISOString().slice(0, 10); setItem(c.key, patch); renderAll(); drawDetail(c); } },
        STATUSES.map(([v, l]) => h('option', { value: v, selected: status(c) === v ? true : null, text: l })));
      const s = status(c);
      right.append(h('div', { class: 'form' },
        h('label', null, 'Status', sel),
        field('Graded estimate ($)', 'gradedValue', 'number', { ph: 'e.g. from CovrPrice' }),
        ['grade', 'submitted', 'graded', 'listed', 'sold'].includes(s) ? field('Grader / submission #', 'submission') : null,
        ['graded', 'listed', 'sold'].includes(s) ? field('Certified grade', 'gradedGrade', 'text', { ph: 'e.g. 9.4' }) : null,
        ['listed', 'sold', 'sell', 'graded', 'lot'].includes(s) ? field('Asking price ($)', 'ask', 'number') : null,
        ['listed', 'sold'].includes(s) ? field('Listed on', 'listedOn', 'text', { ph: 'eBay, Facebook, comic shop…' }) : null,
        s === 'sold' ? field('Sold for ($)', 'soldPrice', 'number') : null,
        s === 'sold' ? field('Fees paid ($)', 'soldFees', 'number', { ph: 'blank = estimate' }) : null,
        s === 'sold' ? field('Shipping cost ($)', 'shipCost', 'number') : null,
        ['graded', 'listed', 'sold'].includes(s) && it.submission ? field('Grading cost ($)', 'gradeCost', 'number') : null,
        s === 'sold' ? field('Sold on', 'soldDate', 'date') : null,
        h('label', { class: 'wide' }, 'Notes', h('textarea', { placeholder: 'Condition, defects, buyer, anything…', oninput: (e) => setItem(c.key, { notes: e.target.value }) }, it.notes || ''))));
    } else right.append(h('p', { class: 'ro-note' }, 'To track grading and sales for this comic, turn on editing in ', h('a', { href: '#', onclick: (e) => { e.preventDefault(); closeDetail(); openSettings('editing'); }, text: 'Settings → Editing' }), '.'));
    body.append(h('div', { class: 'cover' }, coverEl(c)), right);
  }

  // ---------- browse controls ----------
  function resetFilters() { Object.assign(ui, { fKey: '', fStatus: '*', fBox: '*', fPub: '', fAge: '', fVal: '', fCover: '', shown: ui.page }); }
  function fillSelect(sel, opts, value) { sel.replaceChildren(...opts.map(([v, l]) => h('option', { value: v, text: l }))); sel.value = value; }
  function syncFilterInputs() {
    $('q').value = ui.q; $('sort').value = ui.sort;
    fillSelect($('fStatus'), [['*', 'Any status'], ...STATUSES], ui.fStatus);
    const boxes = [...new Set(comics.map((c) => c.box))].sort((a, b) => (a === '') - (b === '') || (+a - +b));
    fillSelect($('fBox'), [['*', 'Any box'], ...boxes.map((b) => [b, b ? 'Box ' + b : 'No box'])], ui.fBox);
    fillSelect($('fPub'), [['', 'Any publisher'], ...group(comics, (c) => c.publisher).sort((a, b) => b.comics - a.comics).map((g) => [g.key, `${g.key} (${g.comics})`])], ui.fPub);
    fillSelect($('fAge'), [['', 'Any era'], ...group(comics, (c) => c.age).sort((a, b) => b.comics - a.comics).map((g) => [g.key, `${g.key} (${g.comics})`])], ui.fAge);
    $('fKey').value = ui.fKey; $('fVal').value = ui.fVal; $('fCover').value = ui.fCover;
    if (filterCount()) $('filters').hidden = false;
  }
  function updateBulk() { $('bulkCount').textContent = `${fmt.format(ui.selected.size)} selected`; }
  function exportCSV(list, name) {
    const cols = ['Rank', 'Series', 'Issue', 'Story', 'Year', 'Publisher', 'Key', 'Box', 'CLZ value', 'CovrPrice', 'Status', 'Graded estimate', 'Certified grade', 'Asking', 'Listed on', 'Sold for', 'Fees', 'Sold on', 'Notes'];
    const lines = [cols.join(',')].concat(list.map((c) => { const it = item(c.key); return [c.rank, c.series, c.issue, c.title, c.year, c.publisher, c.ki, c.box, c.v, c.cp, STATUS_LABEL[status(c)] === 'Unsorted' ? '' : STATUS_LABEL[status(c)], it.gradedValue, it.gradedGrade, it.ask, it.listedOn, it.soldPrice, it.soldFees, it.soldDate, it.notes].map(csvCell).join(','); }));
    download(name, lines.join('\n'));
  }
  function pullList(list) {
    const byBox = group(list, (c) => c.box, (k) => k ? 'Box ' + k : 'No box').sort((a, b) => (a.key === '') - (b.key === '') || (+a.key - +b.key));
    const w = window.open('', '_blank'); if (!w) { toast('Allow pop-ups to print the pull list.'); return; }
    const d = w.document; d.title = 'Pull list';
    const st = d.createElement('style'); st.textContent = 'body{font:14px system-ui;margin:24px}h1{font-size:20px}h2{font-size:16px;margin:18px 0 6px}li{margin:2px 0}'; d.head.append(st);
    const b = d.body; const H1 = d.createElement('h1'); H1.textContent = `Pull list — ${list.length} comics`; b.append(H1);
    for (const g of byBox) { const h2 = d.createElement('h2'); h2.textContent = `${g.label} (${g.comics})`; const ul = d.createElement('ul'); g.list.sort((a, b2) => a.series.localeCompare(b2.series)).forEach((c) => { const li = d.createElement('li'); li.textContent = `☐ ${c.comic}${c.year ? ' (' + c.year + ')' : ''} — ${money(c.v)}`; ul.append(li); }); b.append(h2, ul); }
    w.focus();
  }

  // ---------- sections: collapse, show/hide, navigation ----------
  function applySections() {
    const open = ls.get('openSecs', {}); const hidden = ls.get('hiddenSecs', {});
    $$('[data-sec]').forEach((s) => { s.classList.toggle('open', !!open[s.dataset.sec]); s.hidden = !!hidden[s.dataset.sec]; });
  }
  function setOpen(k, on, scroll) {
    const open = ls.get('openSecs', {}); if (on) open[k] = true; else delete open[k]; ls.set('openSecs', open); applySections();
    const sec = document.querySelector(`[data-sec="${k}"]`);
    if (scroll && sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function go(where) {
    if (where === 'novalue') { resetFilters(); ui.fVal = 'none'; syncFilterInputs(); renderBrowse(); where = 'browse'; }
    const sec = document.querySelector(`[data-sec="${where}"]`); if (!sec) return;
    const hidden = ls.get('hiddenSecs', {}); if (hidden[where]) { delete hidden[where]; ls.set('hiddenSecs', hidden); }
    setOpen(where, true, true);
  }

  // ---------- settings drawer ----------
  function openSettings(tab = 'general') {
    $('drawer').classList.add('open'); $('drawer').setAttribute('aria-hidden', 'false'); $('scrim').hidden = false;
    $$('#drawerTabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    renderSettings(tab);
  }
  function closeSettings() { $('drawer').classList.remove('open'); $('drawer').setAttribute('aria-hidden', 'true'); $('scrim').hidden = true; }
  const setBlock = (title, hint, ...kids) => h('div', { class: 'set' }, h('h4', { text: title }), hint ? h('p', { class: 'hint' }, hint) : null, ...kids);
  const segCtl = (opts, value, onPick) => { const s = h('div', { class: 'seg' }); opts.forEach(([v, l]) => { const b = h('button', { type: 'button', class: v === value ? 'on' : null }, l); b.addEventListener('click', () => { $$('button', s).forEach((x) => x.classList.toggle('on', x === b)); onPick(v); }); s.append(b); }); return s; };

  function applyTheme(t) {
    const real = t === 'auto' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : t;
    document.documentElement.dataset.theme = real;
    document.querySelector('meta[name="theme-color"]').content = real === 'light' ? '#e9edf4' : '#070a11';
  }

  function renderSettings(tab) {
    const body = $('drawerBody'); body.replaceChildren();
    const p = prefs();
    if (tab === 'general') {
      body.append(
        setBlock('Appearance', 'Dark matches Daily HQ. Auto follows your device.', segCtl([['dark', 'Dark'], ['light', 'Light'], ['auto', 'Auto']], ls.get('theme', 'dark'), (v) => { ls.set('theme', v); applyTheme(v); })),
        setBlock('Browse view', null, segCtl([['covers', 'Covers'], ['list', 'List']], ui.view, (v) => { ui.view = v; ls.set('view', v); renderBrowse(); }),
          h('div', { class: 'field' }, h('span', null, 'Covers per page'), h('select', { onchange: (e) => { ui.page = ui.shown = +e.target.value; ls.set('page', ui.page); renderBrowse(); } }, [30, 60, 120, 240].map((n) => h('option', { value: n, selected: n === ui.page ? true : null, text: n }))))),
        setBlock('Sections', 'Choose which tiles show. Tap a tile to open its details; tap its title again to fold it back into a tile.',
          ...SECTIONS.map(([k, l]) => h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !ls.get('hiddenSecs', {})[k] ? true : null, onchange: (e) => { const hs = ls.get('hiddenSecs', {}); if (e.target.checked) delete hs[k]; else hs[k] = true; ls.set('hiddenSecs', hs); applySections(); } }), l)),
          h('div', { class: 'inline' }, h('button', { class: 'btn', type: 'button', onclick: () => { ls.set('openSecs', Object.fromEntries(SECTIONS.map(([k]) => [k, true]))); applySections(); } }, 'Expand all'), h('button', { class: 'btn', type: 'button', onclick: () => { ls.set('openSecs', {}); applySections(); } }, 'Collapse all to tiles'))),
        setBlock('Add to your home screen', null, h('p', { class: 'hint' }, 'iPhone: open this page in Chrome or Safari, tap Share, then Add to Home Screen. Mac: in Chrome, use Install in the address bar or the ⋮ menu.')));
    }
    if (tab === 'selling') {
      const pf = (label, hint, k, step = '0.01') => h('div', { class: 'field' }, h('span', null, label, hint ? h('small', { text: hint }) : null), h('input', { type: 'number', step, inputmode: 'decimal', value: p[k], onchange: (e) => { const v = num(e.target.value); if (v == null) return; state.prefs = { ...prefs(), [k]: v }; saveState(); renderAll(); } }));
      body.append(
        setBlock('Selling costs', unlocked ? 'Used for every net figure in the app. Saved for all your devices.' : 'Used for every net figure in the app. Turn on editing to save them for all devices; for now they apply on this device.',
          pf('Selling fee (%)', 'eBay’s final value fee for comics is roughly 13%; check your own rate', 'feePct'),
          pf('Per-order fee ($)', 'Fixed fee charged on each sale', 'perSaleFee'),
          pf('Shipping per sale ($)', 'Your cost: mailer, boards, postage', 'shipCost'),
          pf('Grading cost per book ($)', 'Fee plus your share of shipping and insurance', 'gradeCost')),
        setBlock('Grading shortlist', null, pf('Any comic worth at least ($)', null, 'candMin', '1'), pf('Major keys worth at least ($)', null, 'candMajorMin', '1')),
        setBlock('Lots', null, pf('Comics under this value go in lots ($)', null, 'lotMax', '1'), pf('Minimum comics per series', null, 'lotMinCount', '1')),
        h('button', { class: 'btn', type: 'button', onclick: () => { state.prefs = { ...DEFAULT_PREFS }; saveState(); renderAll(); renderSettings('selling'); toast('Selling settings reset'); } }, 'Reset to defaults'));
    }
    if (tab === 'data') renderDataTab(body);
    if (tab === 'editing') {
      const inp = h('input', { type: 'password', placeholder: 'Edit key', value: editKey, autocomplete: 'off', autocapitalize: 'characters' });
      body.append(setBlock('Editing', 'Anyone with the link can look at your collection. Only someone with your edit key can change statuses, sales or values, and the changes sync to all your devices.',
        unlocked ? h('div', null, h('p', { class: 'hint' }, h('b', { text: 'Editing is on' }), ' on this device.'), h('button', { class: 'btn', type: 'button', onclick: () => { editKey = ''; ls.set('editKey', ''); lock('Editing turned off on this device'); renderSettings('editing'); } }, icon('lock'), 'Turn off editing here'))
          : h('div', null, h('div', { class: 'inline' }, inp, h('button', { class: 'btn primary', type: 'button', onclick: async (e) => {
            const k = inp.value.trim().toUpperCase(); if (!k) return; e.target.disabled = true;
            if (await checkKey(k)) { editKey = k; ls.set('editKey', k); unlocked = true; applyLock(); await loadRemote(true); renderAll(); toast('Editing turned on'); renderSettings('editing'); }
            else { toast('That key didn’t work. Check it and try again.'); e.target.disabled = false; }
          } }, 'Turn on')))));
      body.append(setBlock('Backup', 'Download everything you’ve recorded — statuses, estimates, sales and notes.', h('div', { class: 'inline' },
        h('button', { class: 'btn', type: 'button', onclick: () => download(`my-comics-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 1), 'application/json') }, icon('download'), 'Download backup'),
        h('button', { class: 'btn', type: 'button', onclick: () => exportCSV(ranked, 'my-comics-all.csv') }, icon('download'), 'Whole collection CSV'))));
    }
  }

  function renderDataTab(body) {
    body.append(setBlock('Where values come from', null,
      h('p', { class: 'hint' }, `Now showing: ${source.kind === 'base' ? 'the CLZ export of ' + dateStr(source.at) : source.name + ', imported ' + dateStr(source.at)}.`),
      h('p', { class: 'hint' }, 'Values come from CovrPrice through CLZ. To refresh them: in CLZ Comics Web run Update Values, then Export to CSV (All Comics, with the Value, CovrPrice Value, Core ComicID and Storage Box fields), and load that file here. CovrPrice values can only be exported while you have the yearly CovrPrice plan.')));
    const file = h('input', { type: 'file', accept: '.csv,text/csv', style: 'width:100%' });
    const out = h('div');
    file.addEventListener('change', async () => {
      const f = file.files[0]; if (!f) return;
      out.replaceChildren(h('p', { class: 'hint', text: 'Reading…' }));
      let built, text;
      try { text = await f.text(); built = buildComics(text); } catch (e) { out.replaceChildren(h('p', { class: 'hint down', text: e.message || 'Could not read that file.' })); return; }
      const nl = built.list, oldTotal = comics.reduce((a, c) => a + (c.v ?? 0), 0), newTotal = nl.reduce((a, c) => a + (c.v ?? 0), 0);
      const oldMap = new Map(comics.map((c) => [c.key, c]));
      const changes = nl.filter((c) => oldMap.has(c.key) && (oldMap.get(c.key).v ?? 0) !== (c.v ?? 0)).map((c) => ({ c, d: (c.v ?? 0) - (oldMap.get(c.key).v ?? 0) })).sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
      const added = nl.filter((c) => !oldMap.has(c.key)).length, removed = comics.filter((c) => !nl.some((n) => n.key === c.key)).length;
      const orphan = Object.keys(state.items).filter((k) => !nl.some((n) => n.key === k)).length;
      const warn = [!built.hasValue && 'This file has no Value column, so every comic will show no value.', !built.hasCid && 'This file has no Core ComicID column, so covers and your saved statuses won’t line up. Add that field to the export.'].filter(Boolean);
      out.replaceChildren(h('div', { class: 'diff' },
        h('div', null, h('b', { text: `${fmt.format(nl.length)} comics · ${money(newTotal)}` }), ` (now ${fmt.format(comics.length)} · ${money(oldTotal)}; `, h('span', { class: newTotal >= oldTotal ? 'up' : 'down', text: (newTotal >= oldTotal ? '+' : '') + money(newTotal - oldTotal) }), ')'),
        h('div', { class: 'muted', text: `${fmt.format(changes.length)} values changed · ${fmt.format(added)} new · ${fmt.format(removed)} no longer in the file${orphan ? ` · ${orphan} saved statuses won’t match` : ''}` }),
        changes.length ? h('ul', null, changes.slice(0, 6).map(({ c, d }) => h('li', null, `${c.comic}: `, h('span', { class: d >= 0 ? 'up' : 'down', text: (d >= 0 ? '+' : '') + money(d) })))) : null,
        warn.map((w) => h('p', { class: 'down', text: w })),
        h('div', { class: 'inline' }, h('button', { class: 'btn primary', type: 'button', onclick: async (e) => {
          e.target.disabled = true;
          const snapshot = { total: newTotal, covr: nl.reduce((a, c) => a + (c.cp ?? 0), 0), count: nl.length, top100: nl.map((c) => c.v ?? 0).sort((a, b) => b - a).slice(0, 100).reduce((a, b) => a + b, 0) };
          if (unlocked) {
            try {
              const r = await fetch(API, { method: 'PUT', headers: { 'content-type': 'application/json', 'x-comics-key': editKey }, body: JSON.stringify({ kind: 'collection', csv: text, name: f.name, snapshot }) });
              if (!r.ok) throw new Error();
              const j = await r.json();
              history.push({ at: j.importedAt, ...snapshot });
              source = { kind: 'import', at: j.importedAt, name: f.name };
            } catch { toast('Couldn’t save the new values. Check your connection.'); e.target.disabled = false; return; }
          } else {
            ls.set('localCollection', { csv: text, name: f.name, at: Date.now() });
            source = { kind: 'import', at: Date.now(), name: f.name + ' (this device only)' };
          }
          comics = nl; renderAll(); syncFilterInputs(); toast('Values updated'); renderSettings('data');
        } }, unlocked ? 'Use these values everywhere' : 'Use on this device'))));
    });
    body.append(setBlock('Load a new CLZ export', unlocked ? 'You’ll see what changed before anything is replaced. Your statuses and sales stay attached to each comic.' : 'Editing is off, so new values will apply on this device only. Turn on editing to update them for every device.', file, out));
    if (source.kind !== 'base') body.append(setBlock('Go back', null, h('button', { class: 'btn', type: 'button', onclick: async () => {
      if (unlocked) { try { await fetch(API, { method: 'PUT', headers: { 'content-type': 'application/json', 'x-comics-key': editKey }, body: '{"kind":"reset-collection"}' }); } catch {} }
      ls.set('localCollection', null); await loadBase(); renderAll(); syncFilterInputs(); renderSettings('data'); toast('Back to the Nov 8 export');
    } }, 'Use the original Nov 8 export')));
    if (history.length) body.append(setBlock('Value snapshots', null, h('div', null, history.slice().reverse().map((s) => h('div', { class: 'field' }, h('span', { text: dateStr(s.at) }), h('b', { class: 'num', text: money(s.total) }))))));
  }

  // ---------- loading ----------
  async function loadBase() {
    const text = await (await fetch(BASE_CSV)).text();
    comics = buildComics(text).list;
    source = { kind: 'base', at: Date.parse(BASE_DATE + 'T12:00:00'), name: 'CLZ export' };
  }
  async function loadRemote(force) {
    try {
      const r = await fetch(API, { cache: 'no-store' });
      if (!r.ok) return;
      const j = await r.json();
      if (j.state?.data) { state = { items: {}, ...j.state.data, prefs: { ...DEFAULT_PREFS, ...(j.state.data.prefs || {}) } }; ls.set('state', state); }
      history = Array.isArray(j.history) ? j.history : [];
      if (j.collection?.csv && (force || source.kind === 'base')) { comics = buildComics(j.collection.csv).list; source = { kind: 'import', at: j.collection.importedAt, name: j.collection.name }; }
    } catch {}
  }

  async function init() {
    applyTheme(ls.get('theme', 'dark'));
    state = ls.get('state', state); state.prefs = { ...DEFAULT_PREFS, ...(state.prefs || {}) }; state.items = state.items || {};
    try { await loadBase(); } catch { $('lede').textContent = 'Couldn’t load the collection. Check your connection and reopen the app.'; return; }
    const local = ls.get('localCollection', null);
    if (local?.csv) { try { comics = buildComics(local.csv).list; source = { kind: 'import', at: local.at, name: local.name + ' (this device only)' }; } catch {} }
    await loadRemote(false);
    if (editKey) { unlocked = await checkKey(editKey); if (!unlocked) { editKey = ''; ls.set('editKey', ''); } }
    applyLock();
    derive(); syncFilterInputs(); renderAll();
    for (const f of COVER_FILES) {
      try { const obj = await (await fetch(f)).json(); for (const [k, v] of Object.entries(obj)) covers.set(k, v); renderBrowse(); renderGrading(); renderTop(); renderSelling(); renderSummaries(); } catch {}
    }
  }

  // ---------- events ----------
  $$('[data-go]').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));
  $$('.sec-h').forEach((b) => b.addEventListener('click', () => { const s = b.closest('[data-sec]'); setOpen(s.dataset.sec, !s.classList.contains('open'), !s.classList.contains('open')); }));
  $$('[data-sec]').forEach((s) => s.addEventListener('click', (e) => { if (!s.classList.contains('open') && !e.target.closest('.sec-h')) setOpen(s.dataset.sec, true, true); }));
  let qT; $('q').addEventListener('input', (e) => { clearTimeout(qT); qT = setTimeout(() => { ui.q = e.target.value.trim().toLowerCase(); ui.shown = ui.page; renderBrowse(); }, 120); });
  $('sort').addEventListener('change', (e) => { ui.sort = e.target.value; ui.shown = ui.page; renderBrowse(); });
  $('filterBtn').addEventListener('click', () => { $('filters').hidden = !$('filters').hidden; });
  [['fKey', 'fKey'], ['fStatus', 'fStatus'], ['fBox', 'fBox'], ['fPub', 'fPub'], ['fAge', 'fAge'], ['fVal', 'fVal'], ['fCover', 'fCover']].forEach(([id, k]) => $(id).addEventListener('change', (e) => { ui[k] = e.target.value; ui.shown = ui.page; renderBrowse(); }));
  $('clearFilters').addEventListener('click', () => { resetFilters(); syncFilterInputs(); renderBrowse(); });
  $$('[data-view]').forEach((b) => b.addEventListener('click', () => { ui.view = b.dataset.view; ls.set('view', ui.view); renderBrowse(); }));
  $('more').addEventListener('click', () => { ui.shown += ui.page; renderBrowse(); });
  $$('[data-top]').forEach((b) => b.addEventListener('click', () => { ui.topN = +b.dataset.top; renderTop(); }));
  $('exportBtn').addEventListener('click', () => exportCSV(matches(), 'my-comics.csv'));
  $('selectBtn').addEventListener('click', () => { ui.selecting = !ui.selecting; ui.selected.clear(); $('bulk').hidden = !ui.selecting; ui.view = 'covers'; updateBulk(); renderBrowse(); });
  fillSelect($('bulkStatus'), STATUSES.map(([v, l]) => [v, v ? 'Set to: ' + l : 'Clear status']), 'sell');
  $('bulkApply').addEventListener('click', () => { const s = $('bulkStatus').value; ui.selected.forEach((k) => setItem(k, { status: s })); toast(`${fmt.format(ui.selected.size)} comics updated`); ui.selected.clear(); updateBulk(); renderAll(); });
  $('bulkAll').addEventListener('click', () => { matches().slice(0, ui.shown).forEach((c) => ui.selected.add(c.key)); updateBulk(); renderBrowse(); });
  $('bulkClear').addEventListener('click', () => { ui.selecting = false; ui.selected.clear(); $('bulk').hidden = true; renderBrowse(); });
  $('openSettings').addEventListener('click', () => openSettings());
  $('closeSettings').addEventListener('click', closeSettings); $('scrim').addEventListener('click', closeSettings);
  $$('#drawerTabs button').forEach((b) => b.addEventListener('click', () => { $$('#drawerTabs button').forEach((x) => x.classList.toggle('on', x === b)); renderSettings(b.dataset.tab); }));
  $('sync').addEventListener('click', () => openSettings('editing'));
  $('mClose').addEventListener('click', closeDetail); $('mPrev').addEventListener('click', () => stepDetail(-1)); $('mNext').addEventListener('click', () => stepDetail(1));
  $('modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeDetail(); });
  document.addEventListener('keydown', (e) => {
    if (!$('modal').hidden) { if (e.key === 'Escape') closeDetail(); if (e.target.matches('input,textarea,select')) return; if (e.key === 'ArrowLeft') stepDetail(-1); if (e.key === 'ArrowRight') stepDetail(1); return; }
    if (e.key === 'Escape') closeSettings();
    if (e.target.matches('input,textarea,select')) return;
    if (e.key === '/') { e.preventDefault(); go('browse'); $('q').focus(); }
    if (e.key === 's') openSettings();
  });
  matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', () => { if (ls.get('theme', 'dark') === 'auto') applyTheme('auto'); });

  init();
})();
