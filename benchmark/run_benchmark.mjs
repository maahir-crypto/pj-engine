import { readFileSync, writeFileSync } from 'node:fs';
import { kundli, panchangAt, choghadiya, vimshottariDasha } from '../dist/index.js';
import { createCalculations, Astronomy } from '../dist/internal.js';
const root = new URL('../', import.meta.url);
const data = JSON.parse(readFileSync(new URL('reference/charts.json', import.meta.url)));
const pairs = JSON.parse(readFileSync(new URL('../tests/milan-pairs.json', import.meta.url)));
const PJ = createCalculations();
const metrics = new Map();
const angle = (a,b) => Math.abs(((a-b+540)%360)-180)*3600;
function add(name,error,tolerance,unit,details) {
  if (!Number.isFinite(error)) throw Error('Non-finite metric: '+name);
  if (!metrics.has(name)) metrics.set(name,{ tolerance,unit,samples:[] });
  metrics.get(name).samples.push({error,details});
}
let polarMissing = 0, solarMissing = 0, solarDisagreements = 0, boundaries = 0;
const timezoneExcluded = [];
const now = '2026-11-27T00:00:00Z';
for (const c of data.charts) {
  const k = kundli(c.input,now), r = c.reference;
  const details = {id:c.id,input:c.input};
  if (+new Date(k.utc) !== c.utcMs || k.offsetMinutes !== c.offsetMinutes) {
    timezoneExcluded.push({...details,packageOffset:k.offsetMinutes,referenceOffset:c.offsetMinutes}); continue;
  }
  for (const [body,longitude] of Object.entries(r.longitudes)) {
    const actual = k.bodies[body].lon;
    const error = angle(actual,longitude);
    add(body,error,10,'arcsec',details);
    add('Planets and mean nodes',error,10,'arcsec',{...details,body});
    add('Rashi all nine bodies',Math.floor(actual/30)===r.rashis[body]?0:1,0,'mismatch',{...details,body});
    add('Nakshatra all nine bodies',Math.floor(actual/(360/27))===Math.floor(longitude/(360/27))?0:1,0,'mismatch',{...details,body});
    add('Pada all nine bodies',Math.floor(actual/(360/108))===Math.floor(longitude/(360/108))?0:1,0,'mismatch',{...details,body});
    if (Math.min(...[30,360/27,360/108].map(width=>Math.min(longitude%width,width-longitude%width)*3600))<=10) boundaries++;
  }
  add('Moon nakshatra',k.nakshatra===r.nakshatra?0:1,0,'mismatch',details);
  add('Moon pada',k.pada===r.pada?0:1,0,'mismatch',details);
  const trueChart = kundli({...c.input,nodeMode:'true'},now);
  add('Rahu true separately',angle(trueChart.bodies.Rahu.lon,r.trueRahu),10,'arcsec',details);
  const asc = angle(k.lagna.lon,r.ascendant), lat = Math.abs(c.input.lat);
  add('Ascendant',asc,60,'arcsec',details);
  add('Ascendant latitude '+(lat<30?'below 30':lat<60?'30 to below 60':'60 and above'),asc,60,'arcsec',details);
  add('Ascendant rashi',k.lagna.sign===Math.floor(r.ascendant/30)?0:1,0,'mismatch',details);
  const p = panchangAt(k.utc);
  for (const key of ['tithi','karana','yoga']) add(key,p[key]===r[key]?0:1,0,'mismatch',details);
  add('Tithi end',Math.abs(+new Date(p.tithiEnd)-r.tithiEndMs)/60000,1,'minutes',details);
  const dasha = vimshottariDasha(k.bodies.Moon.lon,k.utc,now);
  for (let i=0;i<9;i++) {
    add('Mahadasha start',Math.abs(+new Date(dasha.periods[i].start)-r.dasha[i].start)/86400000,1,'days',{...details,period:i,lord:dasha.periods[i].lord,referenceLord:r.dasha[i].lord});
  }
  const date = `${c.input.year}-${String(c.input.month).padStart(2,'0')}-${String(c.input.day).padStart(2,'0')}`;
  const solar = choghadiya(date,c.input);
  if (r.sunriseMs === null || r.sunsetMs === null) { polarMissing++; if (solar) solarDisagreements++; }
  else if (!solar) { solarMissing++; solarDisagreements++; }
  else {
    add('Sunrise',Math.abs(+new Date(solar.sunrise)-r.sunriseMs)/1000,60,'seconds',details);
    add('Sunset',Math.abs(+new Date(solar.sunset)-r.sunsetMs)/1000,60,'seconds',details);
  }
}
const spans = PJ.sadeSati.scan();
let ingressMissing = 0;
const matched = new Set();
for (const ref of data.saturnIngresses) {
  const candidates = spans.slice(1).filter(s=>s.sign===ref.sign && Math.abs(s.start-ref.timeMs)<30*86400000);
  candidates.sort((a,b)=>Math.abs(a.start-ref.timeMs)-Math.abs(b.start-ref.timeMs));
  if (!candidates.length) { ingressMissing++; continue; }
  const s = candidates[0];
  if(matched.has(s.start)) throw Error('Duplicated ingress pairing');
  matched.add(s.start);
  const time = Astronomy.MakeTime(new Date(ref.timeMs));
  const longitude = PJ.planets.siderealAt('Saturn',time);
  const before = PJ.planets.siderealAt('Saturn',time.AddDays(-.25));
  const after = PJ.planets.siderealAt('Saturn',time.AddDays(.25));
  const speed = PJ.planets.angleDiff(after,before)/.5;
  const boundary = (Math.round(longitude/30)*30)%360;
  add('Saturn sign ingress',Math.abs(s.start-ref.timeMs)/60000,10,'minutes',{
    referenceTime:new Date(ref.timeMs).toISOString(),packageTime:new Date(s.start).toISOString(),
    fromSign:ref.fromSign,sign:ref.sign,packageSpeedDegreesPerDay:speed,
    packageLongitudeErrorAtReferenceArcseconds:angle(longitude,boundary)});
}
const extraIngress = spans.slice(1).filter(s=>s.start>=Date.parse('1950-01-01T00:00:00Z')&&s.start<Date.parse('2051-01-01T00:00:00Z')&&!matched.has(s.start)).length;
for (const [id,p] of pairs.entries()) {
  const result = PJ.ashtakoot(p.moonA,p.moonB);
  const ok = JSON.stringify(result.kootas.map(k=>k.score))===JSON.stringify(p.expected.kootas)&&result.total===p.expected.total;
  add('Guna milan inherited pairs',ok?0:1,0,'mismatch',{id});
}
const percentile = (a,p) => a[Math.max(0,Math.ceil(a.length*p)-1)];
const results = [...metrics].map(([name,m])=> {
  const ordered = m.samples.map(s=>s.error).sort((a,b)=>a-b);
  const count = ordered.length, passed = ordered.filter(e=>e<=m.tolerance).length;
  return {name,count,unit:m.unit,tolerance:m.tolerance,median:percentile(ordered,.5),p95:percentile(ordered,.95),max:ordered.at(-1),passed,passRate:passed/count*100,
    worst:m.samples.toSorted?m.samples.toSorted((a,b)=>b.error-a.error).slice(0,3):[...m.samples].sort((a,b)=>b.error-a.error).slice(0,3)};
});
const report = {metadata:data.metadata,chartCount:data.charts.length,timezoneExcluded,boundaryBodyCases:boundaries,polarMissing,solarMissing,solarDisagreements,ingressMissing,extraIngress,results};
writeFileSync(new URL('results.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
const number = x => Number(x.toFixed(6)).toString();
const lines = [
'# Numerical agreement benchmark', '',
'Date: 2026-11-27. pj-engine 0.1.0. Astronomy Engine 2.1.19. '+
`pyswisseph distribution ${data.metadata.pyswissephDistribution}, build ${data.metadata.pyswissephBuild}, Swiss Ephemeris ${data.metadata.swiss}, Python ${data.metadata.python}.`, '',
`Oracle: ${data.metadata.ephemeris}. No Swiss ephemeris data files were downloaded in this run because sandbox DNS failed. The reference generator checks returned ephemeris flags to reject silent fallback.`, '',
`There are ${data.charts.length} charts: ${data.metadata.randomCharts} seed-fixed, stratified uniform cases over 1900 through 2050, plus ${data.metadata.edgeCharts} edge cases. Coordinates are manually written representative test locations for ${data.metadata.indiaCities} Indian and ${data.metadata.cities-data.metadata.indiaCities} other cities. They are test inputs, not a gazetteer.`, '',
'Agreement with Swiss Ephemeris measures numerical agreement, not astrological validity or prediction quality.', '',
'## Settings and comparison', '',
'SIDM_LAHIRI; apparent, geocentric positions; mean node primary. True node is a separate row and does not alter the primary comparison. Planet positions use calc_ut with the selected ephemeris flag plus FLG_SIDEREAL. No FLG_TRUEPOS, J2000 or NONUT flags are used. The package subtracts true Lahiri ayanamsa from apparent true-equinox longitudes; mean nodes subtract mean ayanamsa. The Swiss implementation remains independent, so small differences in nutation, precession, Delta T and node models are measured rather than removed.', '',
'Ascendant reference: tropical swe.houses_ex ascendant minus swe.get_ayanamsa_ex_ut true Lahiri ayanamsa. Equal houses are requested only to avoid polar Placidus failures; no house cusp is compared. The package uses its existing analytic ascendant and whole-sign house assignment.', '',
'Birth inputs have whole-minute precision. Python zoneinfo offsets are rounded to whole minutes to match the existing Intl conversion, including pre-standard-time offsets. Every UTC instant and offset is checked against the package before any metric is accepted. Cases with different timezone database results are excluded and listed below. The explicit 1944 Indian war-time case is included only because both sides agree on +06:30. No ambiguous DST or nonexistent civil time is an intentional fixture.', '',
`Timezone exclusions: ${timezoneExcluded.length}. ${JSON.stringify(timezoneExcluded)}`, '',
'Panchang indices and tithi ends are measured at the birth instant, using panchangAt, rather than the daily API sunrise. Tithi and karana use Moon minus Sun; yoga uses their sidereal sum. The karana index is the half-tithi slot, 0 through 59, rather than the repeating traditional name index. Mahadasha compares the start of each of nine periods, with 365.25 days per year, against an independently implemented timeline from the oracle Moon. Periods are compared by sequence position; differing starting lords are retained in worst-case details.', '',
'Sunrise and sunset use sea-level coordinates, solar upper limb and refraction. Swiss rise_trans uses 1013.25 hPa and 15 C. Astronomy Engine uses SearchRiseSet defaults. Sunset is searched after sunrise, and next sunrise is required, matching the daily API. Different atmosphere and refraction models remain a limitation.', '',
`Polar or out-of-window reference cases: ${polarMissing}; package missing when reference exists: ${solarMissing}; solar availability disagreements: ${solarDisagreements}. These cases are excluded from timing distributions and are disclosed here.`, '',
`Saturn ingresses cover 1950 through 2050, including retrograde re-entries. Oracle scanner: two-day steps, then binary search. Package scanner: unchanged two-day steps and one-second stopping rule. Matched ${data.saturnIngresses.length-ingressMissing} of ${data.saturnIngresses.length}; missing references: ${ingressMissing}; extra package events: ${extraIngress}. The timing pass rate is conditional on matching; missing and extra events are separately reported.`, '',
`Boundary stress: ${boundaries} body cases lie within 10 arcseconds of a sign, nakshatra or pada boundary in the reference. They remain in all exact-match statistics.`, '',
'Guna milan is a published-output cross-check, not a Swiss metric: cross-checked against published Drik Panchang horoscope-match output on 3 Nov 2026, according to the earlier project test record. This run repeats those stored expectations; the historical session cannot be independently recovered. The source record also says displayed Drik totals were truncated, while stored totals preserve fractional sums. All eight individual scores and the stored sum must match. The fixtures contain Moon longitudes and scores only.', '',
'## Polar ascendant correction', '',
'One polar fixture from the original implementation selected the setting intersection of the ecliptic and horizon: 1943-10-07 14:45, latitude 69.65, longitude 18.96, Europe/Oslo. Original sidereal ascendant: 217.8193236261092 degrees; Swiss: 37.819324912322124 degrees. A separate horizontal projection placed the original at azimuth 181.6877131570131 degrees, west of south, and the opposite point at azimuth 1.6877118956831454 degrees, east of north. The package now checks the east component of the ecliptic unit vector and selects the eastern intersection. A regression checks rising altitude and horizon position for 24 hours in each hemisphere. This geometric check establishes a branch error independently of fitting Swiss results. The same correction has been applied to the Pocket Jyotish website. The results below include that correction.', '',
'## Results', '',
'Percentiles use nearest rank. Mismatch rows encode agreement as 0 and disagreement as 1. Tolerances were fixed before the run and were not widened after failures.','',
'| Metric | Cases | Unit | Median | P95 | Max | Tolerance | Pass rate |',
'|---|---:|---|---:|---:|---:|---:|---:|',
...results.map(r=>`| ${r.name} | ${r.count} | ${r.unit} | ${number(r.median)} | ${number(r.p95)} | ${number(r.max)} | <= ${r.tolerance} | ${r.passed}/${r.count} (${r.passRate.toFixed(2)}%) |`), '',
'## Worst cases and interpretation', '',
'All rows below retain measured failures. Planet and ascendant differences can include approximation, nutation and Delta T differences. Moon errors near a discrete boundary can change nakshatra, pada or a starting dasha lord. Long dasha timing errors amplify small Moon longitude differences. True-node definitions and the lunar state-vector approximation can diverge from the Swiss true node. Ingress worst cases include the package angular difference at the reference crossing and its local speed, so the amplification of angular error during slow Saturn motion can be inspected. These are candidate explanations, not isolated causal measurements. Sunrise differences can reflect refraction and atmospheric assumptions. No calculation was changed to fit the oracle.', '',
...results.flatMap(r=>[`### ${r.name}`, '',...r.worst.map(w=>`- Error ${number(w.error)} ${r.unit}: ${JSON.stringify(w.details)}`),'']),
'## Reproduce', '',
'Install the external development oracle in a separate environment: `python -m pip install pyswisseph==2.10.3.2`. It is AGPL-licensed and is not a runtime or development dependency in package.json, is not vendored here and is excluded from the npm artifact. Only numerical outputs and this MIT harness are distributed.', '',
'From the package root run:', '',
'```sh','npm run build','python benchmark/generate_reference.py','node benchmark/run_benchmark.mjs','npm test','```', '',
'The default generator deliberately selects Moshier for reproducibility without data files. To run with Swiss binary data files, supply `--ephe /path/to/ephe`; their hashes and returned flags are recorded. This produces a different benchmark and must be reported as a new run. See [benchmark/README.md](benchmark/README.md) and machine-readable [benchmark/results.json](benchmark/results.json).', '',
'Primary settings documentation: [Swiss Ephemeris programming manual](https://www.astro.com/swisseph/swephprg.htm). Matching interface: [Drik Panchang](https://www.drikpanchang.com/jyotisha/horoscope-match/horoscope-match.html). Runtime upstream: [Astronomy Engine](https://github.com/cosinekitty/astronomy). Oracle distribution: [pyswisseph](https://pypi.org/project/pyswisseph/).'
];
writeFileSync(new URL('BENCHMARK.md',root),lines.join('\n')+'\n');
console.log(JSON.stringify({charts:data.charts.length,ingresses:data.saturnIngresses.length,results:results.map(({worst,...r})=>r)},null,2));
