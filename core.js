/* Walkie core: pure logic with no DOM. Works in the browser (window.Core) and in Node (module.exports). */
(function (root) {
  'use strict';

  const MIN = 60e3, HOUR = 3600e3, DAY = 864e5;

  /* ---------- Times of day ---------- */
  // "19:30" → 1170 (minutes after midnight); null if it isn't a time
  function hm(s) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || '').trim());
    if (!m) return null;
    const h = +m[1], mi = +m[2];
    return h < 24 && mi < 60 ? h * 60 + mi : null;
  }
  const minsOf = (ms) => { const d = new Date(ms); return d.getHours() * 60 + d.getMinutes(); };
  const at = (dayMs, mins) => { const d = new Date(dayMs); d.setHours(Math.floor(mins / 60), mins % 60, 0, 0); return d.getTime(); };
  const startOfDay = (ms) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const addDays = (ms, n) => { const d = new Date(ms); d.setDate(d.getDate() + n); return d.getTime(); };
  const isWeekend = (ms) => { const w = new Date(ms).getDay(); return w === 0 || w === 6; };

  const DEFAULT_TIMES = { bed: '19:30', wd: '07:00', we: '07:30' };
  // Wake-up time (minutes) for the morning of the given date: weekend mornings use the weekend time
  function wakeMins(cfg, dayMs) {
    const c = Object.assign({}, DEFAULT_TIMES, cfg || {});
    return hm(isWeekend(dayMs) ? c.we : c.wd) ?? hm(DEFAULT_TIMES.wd);
  }
  const bedMins = (cfg) => hm((cfg && cfg.bed) || DEFAULT_TIMES.bed) ?? hm(DEFAULT_TIMES.bed);

  // The OK-to-wake clock: 'moon' between bedtime and the next wake-up time, otherwise 'sun'
  function phase(now, cfg) {
    const m = minsOf(now), bed = bedMins(cfg);
    const morning = m < 720 ? now : addDays(now, 1);   // the morning this night belongs to
    const wake = wakeMins(cfg, morning);
    if (m < 720) {
      if (bed < 720) return m >= bed && m < wake ? 'moon' : 'sun';   // bedtime after midnight
      return m < wake ? 'moon' : 'sun';
    }
    return bed >= 720 && m >= bed ? 'moon' : 'sun';
  }
  // The moment the moon next turns into the sun (ms)
  function nextWake(now, cfg) {
    const m = minsOf(now);
    const day = m < 720 ? startOfDay(now) : addDays(startOfDay(now), 1);
    return at(day, wakeMins(cfg, day));
  }
  // Tonight's bedtime (ms), for the evening that starts on the day of `now` (or the previous evening before noon)
  function bedAt(now, cfg) {
    const m = minsOf(now), bed = bedMins(cfg);
    let day = startOfDay(now);
    if (m < 720 && bed >= 720) day = addDays(day, -1);
    return at(day, bed);
  }

  /* ---------- Nights ---------- */
  // A night belongs to the evening it starts on: from 16:00 that day to 13:00 the next.
  const WIN_START = 16 * 60, WIN_END = 13 * 60;
  const SETTLE = 15 * MIN;     // activity this soon after "night night" is settling, not a waking
  const CLUSTER = 20 * MIN;    // activity this close together counts as one waking
  const RANK = { dream: 7, cuddle: 6, toilet: 5, water: 4, voice: 3, wake: 2, love: 1 };
  const WORD = { dream: 'bad dream', cuddle: 'cuddle', toilet: 'toilet', water: 'water', voice: 'voice message', wake: 'awake', love: 'love you' };

  // Turn a raw event into what the sleep page cares about
  function kindOf(e) {
    if (e.type === 'quick') return RANK[e.detail] ? e.detail : null;
    if (e.type === 'voice') return 'voice';
    return null;
  }

  function clean(events) {
    const voided = new Set(events.filter((e) => e.type === 'void').map((e) => e.detail));
    const seen = new Set(), out = [];
    for (const e of events) {
      if (!e || !e.id || seen.has(e.id) || voided.has(e.id) || e.type === 'void' || !isFinite(e.ts)) continue;
      seen.add(e.id);
      out.push(e);
    }
    return out.sort((a, b) => a.ts - b.ts);
  }

  function clusters(points, gap) {
    const out = [];
    for (const p of points.slice().sort((a, b) => a.ts - b.ts)) {
      const last = out[out.length - 1];
      if (last && p.ts - last.end <= gap) { last.end = p.ts; last.items.push(p); }
      else out.push({ start: p.ts, end: p.ts, items: [p] });
    }
    for (const c of out) c.main = c.items.reduce((a, b) => (RANK[b.kind] > RANK[a.kind] ? b : a));
    return out;
  }

  const EARLY = 5 * 60;          // from 05:00 a wake press is the morning; earlier, she may well go back to sleep
  const SLIP = 20e3;             // a wake press this soon after night night is a slip of the finger
  const SHORT = 30 * MIN;        // a night night this short, then up for longer, was play or a nap, not the night

  // One night, for the evening of dayMs (any time on that date)
  function night(evs, dayMs, now) {
    const d0 = startOfDay(dayMs);
    const from = at(d0, WIN_START), to = at(addDays(d0, 1), WIN_END), morning = at(addDays(d0, 1), EARLY);
    const inWin = evs.filter((e) => e.ts >= from && e.ts < to);
    const n = { day: d0, from, to, start: null, end: null, early: null, gaps: [], asleep: null, wakings: [], markers: [], status: 'none', awakeNow: false, events: inWin };
    let sw = inWin.filter((e) => e.type === 'sleep' || e.type === 'wake');
    sw = sw.filter((e, i) => !(e.type === 'wake' && i > 0 && sw[i - 1].type === 'sleep' && e.ts - sw[i - 1].ts < SLIP));
    const sleeps = sw.filter((e) => e.type === 'sleep' && e.ts < morning);   // a night night after 05:00 is the next day's business
    if (!sleeps.length) {
      if (sw.length) n.status = 'nosleep';
      return n;
    }
    // A time a parent added wins over her button
    const pS = sleeps.filter((e) => e.role === 'parent');
    let start = pS.length ? pS[pS.length - 1].ts : sleeps[0].ts;
    if (!pS.length) {
      for (;;) {
        const w = sw.find((e) => e.type === 'wake' && e.ts > start);
        const s2 = w && sleeps.find((e) => e.ts > w.ts);
        if (w && s2 && w.ts - start < SHORT && s2.ts - w.ts >= SHORT) start = s2.ts;
        else if (w && !s2 && w.ts < morning && w.ts - start < SHORT && Math.min(now, to) - w.ts >= SHORT) return n;   // up again: the night hasn't started
        else break;
      }
    }
    n.start = start;
    const after = sw.filter((e) => e.ts > start);
    const lastSleep = sleeps.filter((e) => e.ts >= start).reduce((m, e) => Math.max(m, e.ts), start);
    const pW = after.filter((e) => e.type === 'wake' && e.role === 'parent');
    const upAfter = after.filter((e) => e.type === 'wake' && e.ts > lastSleep);
    const open = now < to;
    if (pW.length) n.end = pW[pW.length - 1].ts;
    else {
      const mw = upAfter.find((e) => e.ts >= morning);
      if (mw) n.end = mw.ts;
      else if (upAfter.length) n.early = upAfter[0].ts;   // up before 05:00, and nothing logged after
    }
    const stop = n.end != null ? n.end : Math.min(Math.max(now, start), to);
    // Awake stretches: a wake press followed later by another night night
    let awakeFrom = null;
    for (const e of after) {
      if (e.ts >= stop) break;
      if (e.type === 'wake' && awakeFrom == null) awakeFrom = e.ts;
      else if (e.type === 'sleep' && awakeFrom != null) { n.gaps.push([awakeFrom, e.ts]); awakeFrom = null; }
    }
    if (n.end == null && awakeFrom != null && open) { n.gaps.push([awakeFrom, stop]); n.awakeNow = true; }
    // Wakings: her wake presses in the middle of the night, and her taps or voice messages after settling
    const pts = [];
    for (const e of inWin) {
      if (e.ts <= start || e.ts >= stop || e.role === 'parent') continue;
      if (e.type === 'wake') { if (sw.includes(e)) pts.push({ ts: e.ts, kind: 'wake', id: e.id }); }
      else if (e.ts > start + SETTLE) { const k = kindOf(e); if (k) pts.push({ ts: e.ts, kind: k, id: e.id }); }
    }
    n.markers = pts;
    n.wakings = clusters(pts, CLUSTER);
    const gapMs = n.gaps.reduce((s, g) => s + (g[1] - g[0]), 0);
    n.status = n.end != null ? 'done' : open ? 'ongoing' : n.early != null ? 'early' : 'nowake';
    n.asleep = n.status === 'done' || n.status === 'ongoing' ? Math.max(0, stop - start - gapMs) : null;
    return n;
  }

  // The last `count` nights, newest first. Includes tonight once its window has started.
  function nights(events, now, count) {
    const evs = clean(events);
    const out = [];
    let day = startOfDay(now);
    if (minsOf(now) < WIN_START) day = addDays(day, -1);
    for (let i = 0; i < count; i++) out.push(night(evs, addDays(day, -i), now));
    return out;
  }

  // The night to headline: tonight once it has started, otherwise last night
  function headline(list, now) {
    if (list[0] && list[0].status === 'none' && minsOf(now) >= WIN_START && list[1]) return list[1];
    return list[0];
  }

  const circMean = (vals, period) => {
    // mean of times that may wrap (e.g. bedtimes around midnight)
    const a = vals.map((v) => (v / period) * 2 * Math.PI);
    const s = a.reduce((t, x) => t + Math.sin(x), 0), c = a.reduce((t, x) => t + Math.cos(x), 0);
    let m = Math.atan2(s, c) / (2 * Math.PI) * period;
    if (m < 0) m += period;
    return Math.round(m);
  };

  // Averages over the last n complete nights
  function averages(list, n) {
    const done = list.filter((x) => x.status === 'done').slice(0, n);
    if (!done.length) return null;
    return {
      count: done.length,
      bed: circMean(done.map((x) => minsOf(x.start)), 1440),
      wake: circMean(done.map((x) => minsOf(x.end)), 1440),
      asleep: Math.round(done.reduce((s, x) => s + x.asleep, 0) / done.length),
      wakings: done.reduce((s, x) => s + x.wakings.length, 0) / done.length,
    };
  }

  const NUM = ['no', 'once', 'twice'];
  const dur = (ms) => {
    const m = Math.round(ms / MIN), h = Math.floor(m / 60);
    return h ? `${h} h ${m % 60} m` : `${m} min`;
  };

  // "Asleep 19:42, awake 06:55. 11 h 13 m, woke once: bad dream at 02:14."
  function sentence(n, fmt) {
    if (!n || n.status === 'none') return 'Last night wasn’t logged. Add the times below.';
    if (n.status === 'nosleep') return `Awake at ${fmt(n.events.filter((e) => e.type === 'wake').pop().ts)}, but going to sleep wasn’t logged. Add it below.`;
    const w = n.wakings, cnt = w.length;
    const list = w.slice(0, 2).map((c) => `${WORD[c.main.kind]} at ${fmt(c.main.ts)}`);
    const wtxt = cnt === 0 ? '' : cnt <= 2 ? `woke ${NUM[cnt]}${cnt ? ': ' : ''}${list.join(' and ')}` : `woke ${cnt} times`;
    if (n.status === 'ongoing') {
      if (n.awakeNow) return `Asleep at ${fmt(n.start)}, awake again since ${fmt(n.gaps[n.gaps.length - 1][0])}.`;
      return `Asleep since ${fmt(n.start)}. ${cnt ? cap(wtxt) + ' so far.' : 'No wakings so far.'}`;
    }
    if (n.status === 'nowake') return `Asleep at ${fmt(n.start)}. Waking up wasn’t logged, so add it below.`;
    if (n.status === 'early') return `Asleep at ${fmt(n.start)}, up at ${fmt(n.early)}, then nothing more was logged. Add the wake-up time below.`;
    return `Asleep ${fmt(n.start)}, awake ${fmt(n.end)}. ${dur(n.asleep)}, ${cnt ? wtxt : 'slept straight through'}.`;
  }
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function avgSentence(a, fmtMins) {
    if (!a) return '';
    const per = a.wakings.toFixed(1).replace(/\.0$/, '');
    return `${a.count === 1 ? 'Last night' : `Last ${a.count} nights`}: bedtime ${fmtMins(a.bed)}, awake ${fmtMins(a.wake)}, ${dur(a.asleep)} asleep, ${per} waking${a.wakings === 1 ? '' : 's'} a night.`;
  }

  // Chart geometry: 18:00 to 10:00 the next morning, as 0..1 fractions
  const AX_FROM = 18 * 60, AX_SPAN = 16 * 60;
  // By the clock on the wall, so marks line up with the 18:00 to 10:00 labels even on clock-change nights
  function axisPos(n, ms) {
    const days = Math.round((startOfDay(ms) - n.day) / DAY);
    return Math.max(0, Math.min(1, (days * 1440 + minsOf(ms) + (ms % MIN) / MIN - AX_FROM) / AX_SPAN));
  }

  /* ---------- Stars: stayed in bed until the sun ---------- */
  const GRACE = 2 * MIN;   // a press in the last two minutes before the sun still counts as waiting
  // The sun for the night that starts on the evening of n.day
  const sunFor = (n, cfg) => { const m = addDays(n.day, 1); return at(m, wakeMins(cfg, m)); };
  // true: earned; false: not this time; null: the night isn't over yet
  function star(n, cfg, now) {
    const sun = sunFor(n, cfg);
    if (n.start == null) return now >= sun ? false : null;   // night night wasn't pressed
    const early = n.events.some((e) => e.type === 'wake' && e.role !== 'parent' && e.ts > n.start + SLIP && e.ts < sun - GRACE);
    if (early) return false;
    return now >= sun ? true : null;
  }
  // Newest first. Nights from before Walkie was first used don't count either way.
  function stars(list, cfg, now) {
    let first = -1;
    list.forEach((n, i) => { if (n.start != null || n.events.length) first = i; });
    return list.map((n, i) => ({ day: n.day, star: i > first ? null : star(n, cfg, now) }));
  }

  /* ---------- Countdown ---------- */
  // "2026-10-31" → number of sleeps from today; 0 on the day itself, null once it has passed
  function sleepsUntil(now, iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]).getTime();
    const n = Math.round((d - startOfDay(now)) / DAY);
    return n < 0 ? null : n;
  }

  /* ---------- Bedtime routine ---------- */
  const ROUTINE = {
    bath: { e: '🛁', t: 'Bath' }, teeth: { e: '🪥', t: 'Teeth' }, pyjamas: { e: '👕', t: 'Pyjamas' }, toilet: { e: '🚽', t: 'Toilet' },
    story: { e: '📚', t: 'Story' }, tidy: { e: '🧸', t: 'Tidy up' }, milk: { e: '🥛', t: 'Milk' }, hair: { e: '💇', t: 'Hair' },
  };
  const ROUTINE_DEFAULT = ['bath', 'teeth', 'pyjamas', 'toilet'];
  const routineItems = (list) => {
    const out = (Array.isArray(list) ? list : ROUTINE_DEFAULT).filter((k, i, a) => ROUTINE[k] && a.indexOf(k) === i).slice(0, 6);
    return out.length ? out : ROUTINE_DEFAULT.slice();
  };
  // Shown from two hours before bedtime until an hour after it
  function routineOn(now, cfg) {
    const m = minsOf(now), bed = bedMins(cfg);
    return m >= bed - 120 && m < bed + 60;
  }

  /* ---------- Games ---------- */
  // What the grown-ups allow: games on or off, and minutes a day (0 = no limit)
  const GM_MINS = [0, 20, 30, 60];
  function gmCfg(cfg) {
    const g = (cfg && cfg.gm) || {};
    return { on: g.on !== false, m: GM_MINS.includes(+g.m) && g.m !== null && g.m !== '' ? +g.m : 30 };
  }
  // The games list (games.json): only pages on the same site as Walkie, so nothing can lead her elsewhere
  function gameList(json, base) {
    const out = [], ids = new Set();
    const list = json && Array.isArray(json.games) ? json.games : [];
    let origin;
    try { origin = new URL(base).origin; } catch { return out; }
    const same = (u) => { try { const x = new URL(String(u), base); return x.origin === origin && /^https?:$/.test(x.protocol) ? x.href : null; } catch { return null; } };
    for (const g of list) {
      if (!g || typeof g !== 'object') continue;
      const id = String(g.id || '').toLowerCase();
      if (!/^[a-z0-9-]{1,30}$/.test(id) || ids.has(id)) continue;
      const url = g.url ? same(g.url) : null;
      const ready = g.ready === true && !!url;
      out.push({ id, name: String(g.name || id).replace(/[<>]/g, '').slice(0, 30), url, icon: g.icon ? same(g.icon) : null,
        emoji: String(g.emoji || '🎮').slice(0, 8), ready });
      ids.add(id);
      if (out.length >= 12) break;
    }
    return out;
  }

  /* ---------- Colours ---------- */
  // Her own colours: from a background and a button colour, work out every shade the screen uses,
  // with text dark or light, whichever reads better on that background.
  const hexRgb = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(String(h || '')); if (!m) return null; const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const rgbHex = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
  const mixRgb = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  function luminance(c) {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  }
  function contrast(a, b) {
    const x = luminance(Array.isArray(a) ? a : hexRgb(a) || [0, 0, 0]), y = luminance(Array.isArray(b) ? b : hexRgb(b) || [0, 0, 0]);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }
  const WHITE = [255, 255, 255], INK_DARK = [24, 20, 30];
  function palette(bgHex, accentHex) {
    const bg = hexRgb(bgHex), ac = hexRgb(accentHex);
    if (!bg || !ac) return null;
    const light = contrast(bg, INK_DARK) >= contrast(bg, WHITE);
    const ink = light ? mixRgb(INK_DARK, ac, 0.1) : mixRgb(WHITE, ac, 0.06);
    const rgba = (c, a) => `rgba(${c.map(Math.round).join(',')},${a})`;
    const onSun = contrast(ac, INK_DARK) >= contrast(ac, WHITE) ? mixRgb(INK_DARK, ac, 0.08) : WHITE;
    return {
      light,
      bg: rgbHex(bg),
      raise: rgbHex(light ? mixRgb(bg, WHITE, 0.55) : mixRgb(bg, WHITE, 0.07)),
      'raise-2': rgbHex(light ? mixRgb(bg, INK_DARK, 0.07) : mixRgb(bg, WHITE, 0.12)),
      line: light ? rgba(INK_DARK, 0.1) : rgba(WHITE, 0.1),
      'line-2': light ? rgba(INK_DARK, 0.18) : rgba(WHITE, 0.2),
      ink: rgbHex(ink),
      'ink-2': rgbHex(mixRgb(ink, bg, 0.3)),
      'ink-3': rgbHex(mixRgb(ink, bg, 0.48)),
      sun: rgbHex(ac),
      'sun-soft': rgba(ac, light ? 0.24 : 0.18),
      'on-sun': rgbHex(onSun),
    };
  }

  // Her colour choices. Classic ones are the app's own dark themes (dusk, sea, aurora, amber, twilight).
  const KID_COLOURS = {
    pastel: [
      { id: 'p-strawberry', name: 'Strawberry milk', bg: '#FCE4EC', ac: '#E05A8E' },
      { id: 'p-mint', name: 'Mint', bg: '#DDF5EA', ac: '#23A06F' },
      { id: 'p-lemon', name: 'Lemon', bg: '#FFF6CC', ac: '#F29E00' },
      { id: 'p-lavender', name: 'Lavender', bg: '#ECE4FB', ac: '#8A63DB' },
      { id: 'p-sky', name: 'Sky', bg: '#DFF0FC', ac: '#2F8FD8' },
      { id: 'p-peach', name: 'Peach', bg: '#FFE7D6', ac: '#EE7A3A' },
    ],
    cartoon: [
      { id: 'c-bubblegum', name: 'Bubblegum', bg: '#FF8DC7', ac: '#6A1FD8' },
      { id: 'c-hero', name: 'Superhero', bg: '#1A43B8', ac: '#FF3B30' },
      { id: 'c-sunshine', name: 'Sunshine', bg: '#FFD23F', ac: '#E5441A' },
      { id: 'c-jungle', name: 'Jungle', bg: '#17723F', ac: '#FFD23F' },
      { id: 'c-ocean', name: 'Ocean', bg: '#005F92', ac: '#FFB703' },
      { id: 'c-grape', name: 'Grape', bg: '#5B2580', ac: '#FF9F1C' },
    ],
    classic: ['dusk', 'sea', 'aurora', 'amber', 'twilight'],
    // make your own: a background, then a button that stands out from it
    bgs: ['#FCE4EC', '#DDF5EA', '#FFF6CC', '#DFF0FC', '#FFFFFF', '#FF8DC7', '#FFD23F', '#1A43B8', '#17723F', '#5B2580', '#3A0F2E', '#110D1A'],
    buttons: ['#E05A8E', '#23A06F', '#F29E00', '#2F8FD8', '#6A1FD8', '#FF3B30', '#FFD23F', '#FF9F1C', '#86E3A8', '#F2A7C8', '#FFFFFF', '#1B1B1F'],
  };
  // the button must stand out: clearly lighter or darker, or a clearly different colour
  function buttonOk(bg, ac) {
    const a = hexRgb(bg), b = hexRgb(ac);
    if (!a || !b) return false;
    const c = contrast(a, b), dist = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    return c >= 1.8 || (c >= 1.25 && dist >= 160);
  }

  /* ---------- Spotify ---------- */
  // A playlist or album the grown-ups pick, from a shared link ("Copy link" in Spotify) or a spotify: address
  function spotifyRef(text) {
    const t = String(text || '').trim();
    let m = /^spotify:(playlist|album):([A-Za-z0-9]{22})$/.exec(t);
    if (!m) m = /^https?:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}(?:-[a-z]{2})?\/)?(?:embed\/)?(playlist|album)\/([A-Za-z0-9]{22})(?:[/?#].*)?$/i.exec(t);
    return m ? { k: m[1].toLowerCase(), id: m[2] } : null;
  }
  const spotifyCid = (x) => (/^[0-9a-f]{32}$/i.test(String(x || '').trim()) ? String(x).trim().toLowerCase() : '');

  /* ---------- Waveform ---------- */
  // Squash a list of 0..1 levels to n bars of 0..9, as a digit string
  function peaks(levels, n) {
    n = n || 28;
    if (!levels.length) return '0'.repeat(n);
    let out = '';
    const max = Math.max(0.05, ...levels);
    for (let i = 0; i < n; i++) {
      const a = Math.floor(i * levels.length / n), b = Math.max(a + 1, Math.floor((i + 1) * levels.length / n));
      let m = 0;
      for (let j = a; j < b && j < levels.length; j++) m = Math.max(m, levels[j]);
      out += Math.min(9, Math.round(9 * Math.sqrt(m / max)));
    }
    return out;
  }

  /* ---------- Pairing link ---------- */
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const SCRIPT_RE = /^https:\/\/script\.google\.com\/macros\/s\/([A-Za-z0-9_-]{20,})\/exec$/;
  // Family settings → the part after # in the pairing link
  function joinHash(f) {
    const p = [`j=${f.x}.${f.k}`];
    if (f.s) { const m = SCRIPT_RE.exec(f.s); p.push(m ? `s=${m[1]}` : `u=${encodeURIComponent(f.s)}`); }
    if (f.n) p.push(`n=${encodeURIComponent(f.n)}`);
    if (f.r && f.r.length) p.push(`r=${f.r.map((x) => `${x.i}:${encodeURIComponent(x.l)}`).join(',')}`);
    return p.join('&');
  }
  function parseJoin(hash) {
    const q = new URLSearchParams(String(hash || '').replace(/^#/, ''));
    const j = q.get('j');
    if (!j) return null;
    const [x, k] = j.split('.');
    if (!/^[a-z0-9]{18}$/.test(x || '') || !/^[A-Za-z0-9_-]{43}$/.test(k || '')) return null;
    const f = { x, k };
    if (q.get('s') && /^[A-Za-z0-9_-]{20,}$/.test(q.get('s'))) f.s = `https://script.google.com/macros/s/${q.get('s')}/exec`;
    else if (q.get('u') && /^https:\/\/script\.google\.com\//.test(q.get('u'))) f.s = q.get('u');
    if (q.get('n')) f.n = q.get('n').slice(0, 30);
    if (q.get('r')) {
      f.r = q.get('r').split(',').map((s) => { const i = s.indexOf(':'); return { i: s.slice(0, i), l: s.slice(i + 1).slice(0, 20) }; })
        .filter((x) => /^[a-z0-9]{6,12}$/.test(x.i) && x.l);
    }
    return f;
  }
  // Read the extra fields Walkie puts in a notification's tap-through link
  function clickInfo(url) {
    const i = String(url || '').indexOf('#');
    if (i < 0) return null;
    const q = new URLSearchParams(url.slice(i + 1));
    const e = q.get('e');
    if (!e) return null;
    return { eid: e, w: q.get('w') || '', d: +(q.get('d') || 0) || 0 };
  }

  /* ---------- Daily send budget ---------- */
  // ntfy.sh allows 250 messages a day per home connection, shared by every phone on the Wi-Fi.
  // Her phone keeps to its daytime limit (70 unless a grown-up raises it), so the evening and night always have room.
  // At night nothing is held back. Reports about what's on (`bg`) stop KEEP short of the limit, so her talking always has room.
  const CAP_DAY = 70, CAPS = [70, 100, 150, 200], KEEP = 30;
  const msgCap = (v) => (CAPS.includes(+v) ? +v : CAP_DAY);
  function budget(state, now, cost, night, essential, cap, bg) {
    const day = new Date(now).toISOString().slice(0, 10);   // ntfy resets at midnight UTC
    const s = state && state.day === day ? { day, n: state.n } : { day, n: 0 };
    const c = msgCap(cap), lim = c - (bg ? KEEP : 0);
    const ok = !!(essential || night || s.n + cost <= lim);
    if (ok) s.n += cost;
    return { ok, state: s, left: Math.max(0, c - s.n), cap: c };
  }

  /* ---------- Burn-in drift ---------- */
  // A slow wander for the night clock: about one lap an hour, never more than `r` from the centre
  function drift(ms, r) {
    const t = ms / HOUR * 2 * Math.PI;
    return { x: Math.round(r * Math.sin(t) * 100) / 100, y: Math.round(r * Math.sin(t * 2.3 + 1) * 0.6 * 100) / 100 };
  }

  /* ---------- QR code (byte mode), after the standard: ISO/IEC 18004 ---------- */
  const QR = (() => {
    const ECC = {   // codewords per block, then number of blocks, versions 1..40
      L: [[7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
        [1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25]],
      M: [[10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
        [1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49]],
      Q: [[13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
        [1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68]],
    };
    const FORMAT = { L: 1, M: 0, Q: 3 };
    const rawModules = (v) => {
      let r = (16 * v + 128) * v + 64;
      if (v >= 2) { const na = Math.floor(v / 7) + 2; r -= (25 * na - 10) * na - 55; if (v >= 7) r -= 36; }
      return r;
    };
    const dataCodewords = (v, e) => Math.floor(rawModules(v) / 8) - ECC[e][0][v - 1] * ECC[e][1][v - 1];
    const gmul = (x, y) => { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z & 0xFF; };
    function rsDivisor(deg) {
      const r = new Array(deg).fill(0); r[deg - 1] = 1;
      let root = 1;
      for (let i = 0; i < deg; i++) {
        for (let j = 0; j < deg; j++) { r[j] = gmul(r[j], root); if (j + 1 < deg) r[j] ^= r[j + 1]; }
        root = gmul(root, 2);
      }
      return r;
    }
    function rsRemainder(data, div) {
      const r = new Array(div.length).fill(0);
      for (const b of data) { const f = b ^ r.shift(); r.push(0); div.forEach((c, i) => { r[i] ^= gmul(c, f); }); }
      return r;
    }
    function encode(text) {
      const bytes = Array.from(new TextEncoder().encode(text));
      let v = 1, e = 'L';
      for (; v <= 40; v++) { const cc = v < 10 ? 8 : 16; if (4 + cc + bytes.length * 8 <= dataCodewords(v, 'L') * 8) break; }
      if (v > 40) throw new Error('Too long for a QR code');
      const cc = v < 10 ? 8 : 16, need = 4 + cc + bytes.length * 8;
      for (const lvl of ['M', 'Q']) if (need <= dataCodewords(v, lvl) * 8) e = lvl;
      // bit stream
      const bits = [];
      const put = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
      put(4, 4); put(bytes.length, cc); bytes.forEach((b) => put(b, 8));
      const cap = dataCodewords(v, e) * 8;
      put(0, Math.min(4, cap - bits.length));
      put(0, (8 - bits.length % 8) % 8);
      for (let pad = 0xEC; bits.length < cap; pad ^= 0xEC ^ 0x11) put(pad, 8);
      const data = [];
      for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
      // blocks and error correction
      const nb = ECC[e][1][v - 1], el = ECC[e][0][v - 1], raw = Math.floor(rawModules(v) / 8);
      const nShort = nb - raw % nb, shortLen = Math.floor(raw / nb), div = rsDivisor(el), blocks = [];
      for (let i = 0, k = 0; i < nb; i++) {
        const dat = data.slice(k, k + shortLen - el + (i < nShort ? 0 : 1));
        k += dat.length;
        const ecc = rsRemainder(dat, div);
        if (i < nShort) dat.push(0);
        blocks.push(dat.concat(ecc));
      }
      const words = [];
      for (let i = 0; i < blocks[0].length; i++) blocks.forEach((b, j) => { if (i !== shortLen - el || j >= nShort) words.push(b[i]); });
      // matrix
      const size = v * 4 + 17;
      const mod = Array.from({ length: size }, () => new Array(size).fill(false));
      const fn = Array.from({ length: size }, () => new Array(size).fill(false));
      const set = (x, y, d) => { mod[y][x] = d; fn[y][x] = true; };
      for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
      const finder = (cx, cy) => {
        for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
          const x = cx + dx, y = cy + dy, dist = Math.max(Math.abs(dx), Math.abs(dy));
          if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, dist !== 2 && dist !== 4);
        }
      };
      finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
      if (v > 1) {
        const na = Math.floor(v / 7) + 2, step = Math.floor((v * 8 + na * 3 + 5) / (na * 4 - 4)) * 2, pos = [6];
        for (let p = size - 7; pos.length < na; p -= step) pos.splice(1, 0, p);
        pos.forEach((a, i) => pos.forEach((b, j) => {
          if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) return;
          for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(a + dx, b + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }));
      }
      const drawFormat = (mask) => {
        const d = (FORMAT[e] << 3) | mask;
        let r = d;
        for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
        const b = ((d << 10) | r) ^ 0x5412, g = (i) => ((b >>> i) & 1) === 1;
        for (let i = 0; i <= 5; i++) set(8, i, g(i));
        set(8, 7, g(6)); set(8, 8, g(7)); set(7, 8, g(8));
        for (let i = 9; i < 15; i++) set(14 - i, 8, g(i));
        for (let i = 0; i < 8; i++) set(size - 1 - i, 8, g(i));
        for (let i = 8; i < 15; i++) set(8, size - 15 + i, g(i));
        set(8, size - 8, true);
      };
      drawFormat(0);
      if (v >= 7) {
        let r = v;
        for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25);
        const b = (v << 12) | r;
        for (let i = 0; i < 18; i++) { const bit = ((b >>> i) & 1) === 1, a = size - 11 + i % 3, c = Math.floor(i / 3); set(a, c, bit); set(c, a, bit); }
      }
      // data, in the zigzag order
      let i = 0;
      for (let right = size - 1; right >= 1; right -= 2) {
        if (right === 6) right = 5;
        for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) {
          const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert;
          if (!fn[y][x] && i < words.length * 8) { mod[y][x] = ((words[i >>> 3] >>> (7 - (i & 7))) & 1) === 1; i++; }
        }
      }
      const MASKS = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
        (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => (x * y) % 2 + (x * y) % 3 === 0,
        (x, y) => ((x * y) % 2 + (x * y) % 3) % 2 === 0, (x, y) => ((x + y) % 2 + (x * y) % 3) % 2 === 0];
      const applyMask = (k) => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fn[y][x] && MASKS[k](x, y)) mod[y][x] = !mod[y][x]; };
      const penalty = () => {
        let p = 0, dark = 0;
        for (let y = 0; y < size; y++) for (let pass = 0; pass < 2; pass++) {
          let run = 1;
          for (let x = 1; x <= size; x++) {
            const same = x < size && (pass ? mod[x][y] === mod[x - 1][y] : mod[y][x] === mod[y][x - 1]);
            if (same) run++; else { if (run >= 5) p += run - 2; run = 1; }
          }
        }
        for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) {
          const c = mod[y][x];
          if (c === mod[y][x + 1] && c === mod[y + 1][x] && c === mod[y + 1][x + 1]) p += 3;
        }
        const pat = [true, false, true, true, true, false, true];
        for (let y = 0; y < size; y++) for (let x = 0; x + 7 <= size; x++) {
          for (const horiz of [true, false]) {
            const ok = pat.every((d, k) => (horiz ? mod[y][x + k] : mod[x + k][y]) === d);
            if (!ok) continue;
            const light = (a, b) => { for (let k = a; k < b; k++) { const yy = horiz ? y : k, xx = horiz ? k : y; if (k >= 0 && k < size && mod[yy][xx]) return false; } return true; };
            if (light(x - 4, x) || light(x + 7, x + 11)) p += 40;
          }
        }
        for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (mod[y][x]) dark++;
        const total = size * size;
        p += Math.max(0, Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
        return p;
      };
      let best = 0, bestP = Infinity;
      for (let k = 0; k < 8; k++) {
        applyMask(k); drawFormat(k);
        const pp = penalty();
        if (pp < bestP) { bestP = pp; best = k; }
        applyMask(k);
      }
      applyMask(best); drawFormat(best);
      return { version: v, ecl: e, mask: best, size, modules: mod };
    }
    // An SVG drawing: dark modules on a light card, with the required quiet zone
    function svg(text, px) {
      const q = encode(text), n = q.size + 8;
      let d = '';
      for (let y = 0; y < q.size; y++) for (let x = 0; x < q.size; x++) if (q.modules[y][x]) d += `M${x + 4} ${y + 4}h1v1h-1z`;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" width="${px}" height="${px}" shape-rendering="crispEdges" role="img" aria-label="Pairing code"><rect width="${n}" height="${n}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
    }
    return { encode, svg };
  })();

  const Core = {
    MIN, HOUR, DAY, DEFAULT_TIMES, hm, minsOf, at, startOfDay, addDays, isWeekend,
    phase, nextWake, bedAt, wakeMins, bedMins,
    clean, clusters, night, nights, headline, averages, sentence, avgSentence, dur, axisPos, AX_FROM, AX_SPAN, WORD, RANK,
    peaks, joinHash, parseJoin, clickInfo, budget, CAP_DAY, CAPS, KEEP, msgCap, drift, QR, B64,
    star, stars, sunFor, sleepsUntil, ROUTINE, ROUTINE_DEFAULT, routineItems, routineOn,
    GM_MINS, gmCfg, gameList,
    hexRgb, contrast, palette, KID_COLOURS, buttonOk,
    spotifyRef, spotifyCid,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Core;
  else root.Core = Core;
})(typeof self !== 'undefined' ? self : this);
