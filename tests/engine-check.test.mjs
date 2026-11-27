import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kundli, localToUtc, lahiriAyanamsa, nakshatraOf } from '../dist/index.js';
import { createCalculations } from '../dist/internal.js';
const PJ = createCalculations();
test('Ported engine fixture and historical timezone checks', () => {
  const k = kundli({ year:1990, month:1, day:15, hour:10, minute:30, lat:25.3167, lon:83.0104, tz:'Asia/Kolkata' });
  const expected = { Lagna:'Pisces 9°34′15″', Sun:'Capricorn 1°03′35″', Moon:'Leo 20°07′26″', Rahu:'Capricorn 23°59′16″' };
  for (const [key, value] of Object.entries(expected)) {
    const p = key === 'Lagna' ? k.lagna : k.bodies[key];
    assert.equal(PJ.names.SIGNS.en[p.sign] + ' ' + PJ.dms(p.degInSign), value);
  }
  assert.equal(localToUtc(1944,8,1,6,0,'Asia/Kolkata').offsetMinutes,390);
  assert.equal(localToUtc(1985,7,20,14,15,'Europe/London').offsetMinutes,60);
  assert.ok(Number.isFinite(lahiriAyanamsa('2000-01-01','mean')));
  assert.equal(nakshatraOf(0).name.en,'Ashwini');
});
