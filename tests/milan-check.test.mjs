import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createCalculations } from '../dist/internal.js';
const PJ = createCalculations();
const pairs = JSON.parse(readFileSync(new URL('./milan-pairs.json', import.meta.url)));
test('200 pairs: inherited Drik Panchang published-output cross-check', () => {
  assert.equal(pairs.length, 200);
  for (const [index,p] of pairs.entries()) {
    const r = PJ.ashtakoot(p.moonA,p.moonB);
    assert.deepEqual(r.kootas.map(k=>k.score),p.expected.kootas,'pair '+index);
    assert.equal(r.total,p.expected.total);
  }
});
