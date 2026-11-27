import { createCalculations } from '../dist/internal.js';
const PJ = createCalculations();
import assert from 'node:assert/strict';
import { test } from 'node:test';
test('Ported panchang calculation checks', () => {
const DELHI = { name: 'Delhi', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata' };
const VARANASI = { name: 'Varanasi', lat: 25.3176, lon: 82.9739, tz: 'Asia/Kolkata' };

function ist(d) {
  if (!d) return '-';
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23' }).format(d);
}
function civil(d) { return PJ.panchang.civilDate(d, 'Asia/Kolkata'); }

let fails = 0, passes = 0;
function check(name, cond, detail) {
  assert.ok(cond, name + (detail ? ': ' + detail : ''));
  if (cond) { passes++; console.log('PASS ' + name + (detail ? ' : ' + detail : '')); }
  else { fails++; console.log('FAIL ' + name + (detail ? ' : ' + detail : '')); }
}

// 1) Makar Sankranti 2027: published ingress 14 Jan 9:14 PM IST
const sank = PJ.panchang.sankrantiInYear(2027);
const makar = sank.find(s => s.index === 9);
console.log('\nSankrantis 2027 (IST):');
sank.forEach(s => console.log('  ', s.name.en, ist(s.time), 'civil', civil(s.time)));
check('Makar sankranti found', !!makar);
if (makar) {
  check('Makar ingress civil date is 2027-01-14', civil(makar.time) === '2027-01-14', ist(makar.time) + ' (published 14 Jan 9:14 PM IST)');
  const published = PJ.localToUtc(2027, 1, 14, 21, 14, 'Asia/Kolkata').utc.getTime();
  const skewMin = Math.abs(makar.time.getTime() - published) / 60000;
  check('Makar ingress within 20 min of published 21:14 IST', skewMin <= 20, 'skew ' + skewMin.toFixed(1) + ' min');
}

// 2) Purnima / Amavasya civil dates (New Delhi sunrise convention: the tithi at sunrise)
const purnima = [
  ['2027-01-22','Pausha'],['2027-02-20','Magha'],['2027-03-22','Phalguna'],['2027-04-20','Chaitra'],
  ['2027-05-20','Vaishakha'],['2027-06-18','Jyeshtha'],['2027-07-18','Ashadha'],['2027-08-16','Shravana'],
  ['2027-09-15','Bhadrapada'],['2027-10-15','Ashwina'],['2027-11-13','Kartika'],['2027-12-13','Margashirsha']
];
const amavasya = [
  ['2027-01-07','Pausha'],['2027-02-06','Magha'],['2027-03-08','Phalguna'],['2027-04-06','Chaitra'],
  ['2027-05-06','Vaishakha'],['2027-06-04','Jyeshtha'],['2027-07-04','Ashadha'],['2027-08-02','Shravana'],
  ['2027-08-31','Bhadrapada'],['2027-09-30','Ashwina'],['2027-10-29','Kartika'],['2027-11-28','Margashirsha'],
  ['2027-12-27','Pausha']
];

function hasTithi(r, name) {
  return r.tithi.name.en === name || (r.nextTithi && r.nextTithi.name.en === name && r.tithi.end && civil(r.tithi.end) === r.date);
}
console.log('\nPurnima 2027 at Delhi (tithi at sunrise or starting later the same civil day):');
purnima.forEach(([d, month]) => {
  const r = PJ.panchang.calc(d, DELHI);
  const det = r.tithi.name.en + ' / ' + r.month.purnimanta.en + ' until ' + ist(r.tithi.end) + (r.nextTithi ? ' then ' + r.nextTithi.name.en : '');
  check(d + ' has Purnima on this civil date', hasTithi(r, 'Purnima'), det);
  check(d + ' purnimanta month is ' + month, r.month.purnimanta.en === month, r.month.purnimanta.en);
});

console.log('\nAmavasya 2027 at Delhi (tithi at sunrise or starting later the same civil day):');
amavasya.forEach(([d, month]) => {
  const r = PJ.panchang.calc(d, DELHI);
  const det = r.tithi.name.en + ' / ' + r.month.purnimanta.en + ' until ' + ist(r.tithi.end) + (r.nextTithi ? ' then ' + r.nextTithi.name.en : '');
  check(d + ' has Amavasya on this civil date', hasTithi(r, 'Amavasya'), det);
  check(d + ' purnimanta month is ' + month, r.month.purnimanta.en === month, r.month.purnimanta.en);
});

// 3) Ekadashi sample + month/paksha
const ekadashi = [
  ['2027-01-03','Saphala','Pausha','krishna'],
  ['2027-01-18','Putrada','Pausha','shukla'],
  ['2027-12-09','Mokshada','Margashirsha','shukla'],
  ['2027-12-23','Saphala','Pausha','krishna']
];
console.log('\nEkadashi samples:');
ekadashi.forEach(([d, label, month, paksha]) => {
  const r = PJ.panchang.calc(d, DELHI);
  check(d + ' ' + label + ' has Ekadashi on this civil date', hasTithi(r, 'Ekadashi'), r.tithi.name.en + ' until ' + ist(r.tithi.end) + (r.nextTithi ? ' then ' + r.nextTithi.name.en + ' until ' + ist(r.nextTithi.end) : ''));
  check(d + ' month ' + month, r.month.purnimanta.en === month, r.month.purnimanta.en);
  check(d + ' paksha ' + paksha, r.tithi.paksha === paksha, r.tithi.paksha);
});

// 4) Magha begins 23 Jan 2027 (day after Pausha Purnima) : published on January vrat page
const jan22 = PJ.panchang.calc('2027-01-22', DELHI);
const jan23 = PJ.panchang.calc('2027-01-23', DELHI);
check('22 Jan still Pausha (purnima day)', jan22.month.purnimanta.en === 'Pausha');
check('23 Jan Magha begins (North India)', jan23.month.purnimanta.en === 'Magha', jan23.month.purnimanta.en + ' ' + jan23.tithi.name.en + ' ' + jan23.paksha);

// 5) Published tithi event times (New Delhi, Drik-checked pages), allow 3 minutes
function utcIst(y,m,d,hh,mm){ return PJ.localToUtc(y,m,d,hh,mm,'Asia/Kolkata').utc.getTime(); }
function close(name, got, expected, mins){
  const skew = Math.abs(got.getTime() - expected) / 60000;
  check(name, skew <= mins, 'got ' + ist(got) + ' skew ' + skew.toFixed(1) + ' min');
}
const feb20 = PJ.panchang.calc('2027-02-20', DELHI);
close('Magha Purnima starts 20 Feb 7:59 IST', feb20.tithi.end, utcIst(2027,2,20,7,59), 3);
close('Magha Purnima ends 21 Feb 4:52 IST', feb20.nextTithi.end, utcIst(2027,2,21,4,52), 3);
const jan18 = PJ.panchang.calc('2027-01-18', DELHI);
close('Putrada Ekadashi starts 18 Jan 10:26 IST', jan18.tithi.end, utcIst(2027,1,18,10,26), 3);
close('Putrada Ekadashi ends 19 Jan 7:49 IST', jan18.nextTithi.end, utcIst(2027,1,19,7,49), 3);
const jun18 = PJ.panchang.calc('2027-06-18', DELHI);
close('Jyeshtha Purnima ends 19 Jun 6:13 IST', jun18.tithi.end, utcIst(2027,6,19,6,13), 3);

// 6) Varanasi today-shaped sanity (sunrise before sunset, tithi present)
const sample = PJ.panchang.calc('2026-11-20', VARANASI);
check('Varanasi 20 Nov 2026 computes', !!sample && !!sample.tithi && sample.sunrise < sample.sunset, sample ? (sample.tithi.name.en + ' sunrise ' + ist(sample.sunrise)) : 'null');


});
