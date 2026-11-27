import { createCalculations, Astronomy } from './internal.js';
const calc = createCalculations();
const json = value => JSON.parse(JSON.stringify(value));
const instant = value => {
  const date = new Date(value);
  if (!Number.isFinite(+date)) throw new RangeError('Invalid instant');
  return date;
};
/** @typedef {import('./index.d.ts').BirthInput} BirthInput */
/** @param {BirthInput} input @param {Date|string|number} [now] */
export function kundli(input, now) {
  const birth = input.tz && !Number.isFinite(input.offsetMinutes)
    ? calc.localToUtc(input.year, input.month, input.day, input.hour, input.minute, input.tz)
    : calc.localToUtcFixed(input.year, input.month, input.day, input.hour, input.minute, input.offsetMinutes);
  return json(calc.computeKundli(input, now === undefined ? birth.utc : instant(now)));
}
/** Civil YYYY-MM-DD, evaluated at local sunrise; null for unavailable solar events. */
export function panchang(date, place) { return json(calc.panchang.calc(date, place)); }
/** All nine periods, with flags evaluated at now, defaulting to birth. */
export function vimshottariDasha(moonSiderealLongitude, birthInstant, now) {
  const birth = instant(birthInstant);
  return json(calc.vimshottari(moonSiderealLongitude, birth, now === undefined ? birth : instant(now)));
}
/** Explicit instant required. Range is 1950 through 2100. */
export function sadeSati(moonRashiIndex, now) {
  return json(calc.sadeSati.report(moonRashiIndex, +instant(now), calc.sadeSati.scan()));
}
/** First argument is the groom side in the inherited asymmetric tables. */
export function gunaMilan(kundliA, kundliB) { return json(calc.milan(kundliA, kundliB)); }
/** IANA time-zone conversion; historical offsets are rounded to whole minutes. */
export function localToUtc(year, month, day, hour, minute, tz) {
  return json(calc.localToUtc(year, month, day, hour, minute, tz));
}
/** Lahiri degrees at a UTC instant, true by default, mean when mode is mean. */
export function lahiriAyanamsa(date, mode = 'true') {
  const T = calc.astro.centuriesTT(Astronomy.MakeTime(instant(date)));
  return mode === 'mean' ? calc.astro.lahiriMean(T) : calc.astro.ayanamsaTrue(T);
}
/** Sidereal longitude in degrees; traditional indices are zero based, pada is 1 to 4. */
export function nakshatraOf(longitude) {
  const info = calc.info(calc.astro.norm360(longitude));
  return { ...info, name: { en: calc.names.NAK.en[info.nak], hi: calc.names.NAK.hi[info.nak] } };
}
/** Panchang limbs at an instant, distinct from the sunrise-based daily API. */
export function panchangAt(date) {
  const at = instant(date), P = calc.panchang;
  const moon = P.sidereal('Moon', at), sun = P.sidereal('Sun', at);
  const elong = calc.astro.norm360(moon - sun), tithi = Math.floor(elong / 12);
  return { tithi, karana: Math.floor(elong / 6), yoga: Math.floor(calc.astro.norm360(moon + sun) / (360 / 27)),
    tithiEnd: P.searchAngle(P.elongAt, ((tithi + 1) * 12) % 360, at, 36)?.toISOString() ?? null };
}
export function choghadiya(date, place) { return json(calc.choghadiya.calc(date, place)); }
export function hora(date, place) { return json(calc.hora.calc(date, place)); }
export function sankrantiInYear(year) { return json(calc.panchang.sankrantiInYear(year)); }
export function mahadashaModel(dasha, now) {
  const value = json(dasha);
  for (const p of value.periods) {
    p.start = instant(p.start); p.end = instant(p.end);
    for (const q of p.sub) { q.start = instant(q.start); q.end = instant(q.end); }
  }
  return json(calc.mahadasha.model(value, instant(now)));
}
export const names = Object.freeze(json({ ...calc.names, ...calc.panchang.names }));
