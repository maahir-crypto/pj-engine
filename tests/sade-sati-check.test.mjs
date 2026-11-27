import { createCalculations } from '../dist/internal.js';
const PJ = createCalculations();
import assert from 'node:assert/strict';
import { test } from 'node:test';
let checks = 0;
function check(title, fn) { test(title, fn); }
const calc = PJ.sadeSati, spans = calc.scan(), day = 86400000;
const now = Date.parse('2026-11-24T12:00:00+05:30');
const civil = ms => new Date(ms + 19800000).toISOString().slice(0, 10);
check('Meen ingress is 29 Mar 2025 IST within one day', () => {
  const s = spans.find(s => s.sign === 11 && s.start > Date.parse('2025-01-01'));
  assert.ok(Math.abs(s.start - Date.parse('2025-03-29T12:00:00+05:30')) < day);
  assert.equal(civil(s.start), '2025-03-29');
});
check('Makar ingress is 24 Jan 2020 IST within two days', () => {
  const s = spans.find(s => s.sign === 9 && s.start > Date.parse('2020-01-01'));
  assert.ok(Math.abs(s.start - Date.parse('2020-01-24T12:00:00+05:30')) < 2 * day);
  assert.equal(civil(s.start), '2020-01-24');
});
check('24 Nov 2026: Mesh phase 1, Meen phase 2, Kumbh phase 3', () => {
  assert.equal(calc.signAt(now), 11);
  for (const [moon, phase] of [[0, 1], [11, 2], [10, 3]]) assert.equal(calc.report(moon, now, spans).status.phase, phase);
});
check('Dhanu Kantak 4th and Singh Ashtam 8th Dhaiya; Makar neither', () => {
  for (const [moon, house] of [[8, 4], [4, 8]]) {
    const s = calc.report(moon, now, spans).status; assert.equal(s.dhaiya, true); assert.equal(s.house, house); assert.equal(s.phase, 0);
  }
  const s = calc.report(9, now, spans).status; assert.equal(s.phase, 0); assert.equal(s.dhaiya, false);
});
check('All twelve Moon signs use inclusive whole sign counting', () => {
  for (let saturn = 0; saturn < 12; saturn++) {
    const states = Array.from({ length: 12 }, (_, moon) => calc.status(moon, saturn));
    assert.equal(states.filter(s => s.phase).length, 3); assert.equal(states.filter(s => s.dhaiya).length, 2);
    assert.equal(calc.status(saturn, saturn).phase, 2);
  }
});
check('2027 Aries entry, Pisces retrograde return, 2028 Aries re-entry retained', () => {
  for (const [date, sign] of [['2027-06-03', 0], ['2027-10-20', 11], ['2028-02-23', 0]]) {
    assert.ok(spans.some(s => civil(s.start) === date && s.sign === sign));
  }
  assert.equal(calc.report(0, Date.parse('2027-07-01'), spans).status.phase, 2);
  assert.equal(calc.report(0, Date.parse('2027-11-01'), spans).status.phase, 1);
  assert.equal(calc.report(0, Date.parse('2028-03-01'), spans).status.phase, 2);
});
check('No spans merged: contiguous coverage and real sign on either side of each ingress', () => {
  assert.equal(spans[0].start, calc.start); assert.equal(spans.at(-1).end, calc.end);
  spans.forEach((s, i) => {
    assert.ok(s.end > s.start); assert.equal(calc.signAt((s.start + s.end) / 2), s.sign);
    if (i) { assert.equal(spans[i - 1].end, s.start); assert.equal(calc.signAt(s.start - 2000), spans[i - 1].sign); assert.equal(calc.signAt(s.start + 2000), s.sign); }
  });
});
check('2027 Kumbh pause remains visible in its current cycle', () => {
  const r = calc.report(10, Date.parse('2027-07-01'), spans);
  assert.equal(r.status.phase, 0); assert.equal(r.cycle.gaps.length, 1);
  assert.equal(civil(r.cycle.gaps[0].start), '2027-06-03'); assert.equal(civil(r.cycle.gaps[0].end), '2027-10-20');
  assert.ok(r.previous.end < r.cycle.start);
});
check('Representative cycles include all three phases and about 7 to 8 active years', () => {
  for (const moon of [0, 10, 11]) {
    const c = calc.report(moon, now, spans).cycle;
    assert.deepEqual([...new Set(c.spans.map(s => s.phase))].sort(), [1, 2, 3]);
    const years = c.spans.reduce((n, s) => n + s.end - s.start, 0) / day / 365.2425;
    assert.ok(years > 7 && years < 8.1, String(years)); console.log('  Moon index ' + moon + ': ' + years.toFixed(3) + ' active years');
    c.gaps.forEach(g => assert.ok(g.end > g.start));
  }
});
check('Next Dhaiya includes current spans and chronological retrograde re-entries', () => {
  const r = calc.report(8, now, spans); assert.ok(r.dhaiya[0].start < now && r.dhaiya[0].end > now);
  assert.equal(civil(r.dhaiya[1].start), '2027-10-20');
  r.dhaiya.forEach((s, i) => { assert.ok(calc.status(8, s.sign).dhaiya); if (i) assert.ok(s.start >= r.dhaiya[i - 1].end); });
});
check('Lahiri birth Moon agrees with existing engine fixture', () => {
  const k = PJ.computeKundli({ year: 1990, month: 1, day: 15, hour: 10, minute: 30, lat: 25.3167, lon: 83.0104, tz: 'Asia/Kolkata' });
  assert.equal(k.rashi, 4); assert.equal(calc.report(k.rashi, now, spans).status.house, 8);
});
check('Range limits and invalid Moon signs handled', () => {
  for (const m of [-1, 12, 0.5, NaN]) assert.throws(() => calc.report(m, now, spans));
  assert.throws(() => calc.report(0, calc.end, spans)); assert.throws(() => calc.report(0, calc.start - 1, spans));
  assert.ok(calc.report(0, calc.start, spans)); assert.ok(calc.report(0, calc.end - 1, spans));
});
