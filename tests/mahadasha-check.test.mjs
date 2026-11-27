import { createCalculations } from '../dist/internal.js';
const PJ = createCalculations();
import assert from 'node:assert/strict';
import { test } from 'node:test';
const api = PJ.mahadasha, YEAR = 365.25 * 86400000;
let groups = 0;
function check(label, fn) { test(label, fn); }
function close(a, b, tolerance = 2) { assert.ok(Math.abs(a - b) <= tolerance, `${a} differs from ${b}`); }
const length = p => +p.end - +p.start;
const birth = new Date('2000-01-01T00:00:00Z'), now = new Date('2026-11-24T12:00:00Z');
check('Known Moon cases: Ashwini start, midpoint, Bharani and Revati', () => {
  for (const [lon, lord, balance] of [[0, 'Ketu', 7], [PJ.NAK_SPAN / 2, 'Ketu', 3.5],
    [PJ.NAK_SPAN * 1.5, 'Venus', 10], [PJ.NAK_SPAN * 26.5, 'Mercury', 8.5]]) {
    const d = PJ.vimshottari(lon, birth, now);
    assert.equal(d.startLord, lord); close(d.balanceYears, balance, 1e-10);
    close(+d.periods[0].end - +birth, balance * YEAR);
  }
});
check('120-year totals, all subdivision proportions and starting lords across 54 Moon positions', () => {
  for (let nak = 0; nak < 27; nak++) for (const fraction of [0, 0.731]) {
    const d = PJ.vimshottari((nak + fraction) * PJ.NAK_SPAN, birth, now);
    assert.equal(d.periods.length, 9);
    close(d.periods.reduce((a, p) => a + length(p), 0), 120 * YEAR, 10);
    api.model(d, now).periods.forEach(p => {
      close(length(p), d.YEARS[p.lord] * YEAR);
      assert.equal(p.sub.length, 9); assert.equal(p.sub[0].lord, p.lord);
      close(p.sub.reduce((a, q) => a + length(q), 0), length(p), 0);
      p.sub.forEach(q => {
        close(length(q), length(p) * d.YEARS[q.lord] / 120);
        const subs = api.pratyantars(q);
        assert.equal(subs.length, 9); assert.equal(subs[0].lord, q.lord);
        close(subs.reduce((a, s) => a + length(s), 0), length(q), 0);
        subs.forEach((s, i) => {
          close(length(s), length(q) * d.YEARS[s.lord] / 120, 10);
          assert.equal(s.lord, PJ.vimshottari.ORDER[(PJ.vimshottari.ORDER.indexOf(q.lord) + i) % 9]);
          if (i) assert.equal(+s.start, +subs[i - 1].end);
        });
      });
    });
  }
});
check('Boundary lookup: inclusive starts, exclusive ends, every level, no rounding gaps', () => {
  const d = PJ.vimshottari(PJ.NAK_SPAN * 7.731, birth, now), m = api.model(d, now);
  m.periods.forEach((p, i) => {
    assert.equal(api.model(d, p.start).maha.lord, p.lord);
    assert.equal(api.model(d, new Date(+p.end - 1)).maha.lord, p.lord);
    if (i < 8) assert.equal(api.model(d, p.end).maha.lord, m.periods[i + 1].lord);
    p.sub.forEach(q => {
      assert.equal(api.model(d, q.start).antar.lord, q.lord);
      assert.equal(api.model(d, new Date(+q.end - 1)).antar.lord, q.lord);
      api.pratyantars(q).forEach(s => {
        assert.ok(api.contains(s, s.start)); assert.ok(!api.contains(s, s.end));
        assert.equal(+api.model(d, s.start).pratyantar.start, +s.start);
        assert.equal(+api.model(d, new Date(+s.end - 1)).pratyantar.start, +s.start);
      });
    });
  });
  assert.equal(api.model(d, new Date(+m.periods[0].start - 1)).maha, undefined);
  assert.equal(api.model(d, m.periods[8].end).maha.lord, m.periods[0].lord);
  assert.equal(api.model(d, m.periods[8].end).cycle, 1);
  const later = api.model(d, new Date(+m.periods[0].start + 240 * YEAR));
  assert.equal(later.maha.lord, m.periods[0].lord); assert.equal(later.cycle, 2);
});
check('Same computeKundli call and result as kundli for four birth cases, saved chart parity', () => {
  const cases = [
    { year: 1990, month: 1, day: 15, hour: 10, minute: 30, lat: 25.3167, lon: 83.0104, tz: 'Asia/Kolkata' },
    { year: 1944, month: 8, day: 1, hour: 6, minute: 0, lat: 19.076, lon: 72.8777, tz: 'Asia/Kolkata' },
    { year: 1985, month: 7, day: 20, hour: 14, minute: 15, lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
    { year: 2001, month: 3, day: 8, hour: 0, minute: 1, lat: -33.8688, lon: 151.2093, offsetMinutes: 660, nodeMode: 'true' }
  ];
  cases.forEach(input => {
    const expected = PJ.computeKundli(input, now), actual = api.calculate(input, now);
    assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    const model = api.model(actual.dasha, now);
    assert.equal(model.maha?.lord, expected.dasha.periods.find(p => p.current)?.lord);
    assert.equal(model.antar?.lord, expected.dasha.periods.find(p => p.current)?.sub.find(q => q.current)?.lord);
    const stored = JSON.parse(JSON.stringify(actual));
    assert.equal(JSON.stringify(PJ.vimshottari(stored.bodies.Moon.lon, new Date(stored.utc), now)), JSON.stringify(expected.dasha));
  });
  const original = PJ.computeKundli; let calls = 0;
  PJ.computeKundli = (input, instant) => { calls++; assert.equal(input, cases[0]); assert.equal(instant, now); return 'sentinel'; };
  assert.equal(api.calculate(cases[0], now), 'sentinel'); assert.equal(calls, 1); PJ.computeKundli = original;
});
