# pj-engine

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.24591697.svg)](https://doi.org/10.5281/zenodo.24591697) [![Demo on Hugging Face](https://img.shields.io/badge/demo-Hugging%20Face-yellow)](https://huggingface.co/spaces/pocketjyotish/pj-engine)

The browser-first Jyotish calculation layer from [Pocket Jyotish](https://pocketjyotish.in). It runs in browsers and Node 18 or later, with no account, network request or DOM access.

Built by the Pocket Jyotish team. MIT licensed.

**Headline benchmark.** Tested against the Swiss Ephemeris on 418 synthetic charts from 1900 to 2050. Nakshatra, ascendant sign, tithi, yoga and karana matched on every chart. Planet signs matched 3,752 of 3,753 times. Guna milan matched 200 of 200 stored couples. Saturn's exact sign-change time is the weak spot and is reported in full. Every number, tolerance and failure is in [BENCHMARK.md](BENCHMARK.md), and you can regenerate it yourself (see below).

The open part is the maths. The Pocket Jyotish AI Astrologer runs on our own knowledge engine, which is not part of this repo.

## Install

This package is not published to npm. Clone the repo and use it directly:

```sh
git clone https://github.com/maahir-crypto/pj-engine.git
cd pj-engine
npm test
```

To use it from another project, install the cloned directory with `npm install /path/to/pj-engine`.

In a browser you can also load the tagged release straight from the jsDelivr CDN, with no install:

```html
<script type="module">
  import { panchang } from 'https://cdn.jsdelivr.net/gh/maahir-crypto/pj-engine@v0.1.0/dist/index.js';
  console.log(panchang('2026-01-01', { lat: 25.3176, lon: 82.9739, tz: 'Asia/Kolkata' }));
</script>
```

The runtime includes a vendored ESM adaptation of MIT-licensed `astronomy-engine` 2.1.19, the sole runtime dependency. No native code or ephemeris data files are shipped. The license and adaptation are recorded in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). There are no install scripts.

The source is ESM JavaScript with JSDoc and a hand-written TypeScript declaration file because `tsc` was unavailable. Built files are included. `npm run build` copies the source and declarations to `dist` without installing a compiler.

## Quick start

This example uses a fictional birth input.

```js
import { kundli, panchang } from 'pj-engine';
const place = { lat: 28.6139, lon: 77.209, tz: 'Asia/Kolkata' };
const input = {
  year: 2000, month: 1, day: 1,
  hour: 12, minute: 0,
  ...place
};
const chart = kundli(input, '2026-01-01T00:00:00Z');
console.log(chart.lagna, chart.bodies.Moon, chart.dasha);
console.log(panchang('2000-01-01', place));
```

All returned values are plain JSON objects, numbers, booleans, arrays, strings or null. Dates are ISO UTC strings except the inherited Sade Sati intervals, which use Unix milliseconds. Missing optional properties are omitted. No API reads the current clock. Omitting `now` in kundli or Vimshottari evaluates current-period flags at the birth instant. Pass `now` to obtain flags for another instant.

## API

| Export | Input | Result |
|---|---|---|
| `kundli(input, now?)` | Civil year, month, day, hour, minute, lat, lon; IANA `tz` or `offsetMinutes`; optional `nodeMode` | Lagna, nine bodies, D9 signs, whole-sign houses, dasha and Manglik flags |
| `panchang(date, place)` | Civil `YYYY-MM-DD`; `{lat, lon, tz, name?}` | Daily sunrise-based limbs, lunar months, solar events and time windows; null when required solar events are unavailable |
| `vimshottariDasha(moonLongitude, birthInstant, now?)` | Sidereal degrees and UTC instants | Nine Mahadashas, each with nine Antardashas; birth balance and flags |
| `sadeSati(moonRashiIndex, now)` | Moon sign 0 through 11 and explicit UTC instant | Current phase, current or next cycle, previous cycle and Dhaiya spans; 1950 through 2100 |
| `gunaMilan(chartA, chartB)` | Two kundli results, groom side first | Eight koota scores, total out of 36, structured note keys and Manglik flags |
| `localToUtc(y, m, d, h, min, tz)` | Civil time and IANA zone | ISO `utc`, `offsetMinutes`, and `note` for a gap or ambiguity |
| `lahiriAyanamsa(instant, mode?)` | UTC instant; `true` default or `mean` | Degrees |
| `nakshatraOf(longitude)` | Sidereal degrees, normalized modulo 360 | Sign, nakshatra, pada, degree within sign and EN/HI nakshatra names |
| `panchangAt(instant)` | UTC instant | Tithi, karana slot, yoga and next tithi end at that instant |
| `choghadiya(date, place)` | Civil date and place | Eight day and eight night slots, Rahu Kaal, Yamaganda, Gulika, Abhijit |
| `hora(date, place)` | Civil date and place | Twelve day and twelve night planetary hours, or null |
| `sankrantiInYear(year)` | Civil year | Solar sign ingress times in that year in Asia/Kolkata |
| `mahadashaModel(dasha, now)` | Dasha result and explicit instant | Contiguous timeline and current Maha, Antar, Pratyantar, including later cycles |
| `names` | Constant | Traditional EN/HI signs, nakshatras, planets, tithis, yoga, karana and lunar months |

UTC instants accept a Date, ISO string or Unix milliseconds. Use an ISO string with `Z` or an explicit offset. Inputs are assumed to be valid calendar dates, finite coordinates and supported zones; this package retains the calculation layer rather than the website's form validation. Explicit numeric `offsetMinutes` takes precedence over `tz`, as in the original engine.

## Conventions

- Apparent geocentric planetary positions use the true ecliptic and equinox of date, with true Lahiri ayanamsa subtracted. The mean Lahiri model and nutation are retained from the site.
- Rahu is the mean node by default; `nodeMode: 'true'` selects the lunar state-vector node. Ketu is opposite Rahu. The node computation uses mean-equinoctial longitude minus mean ayanamsa.
- Sign, nakshatra, tithi, yoga and karana-slot indices start at 0. Pada starts at 1. The karana slot runs from 0 through 59 and maps to repeating traditional names in the daily result.
- Houses are whole sign, with the lagna sign as house 1. D9 is Navamsa. Vimshottari uses a 365.25-day year and the inherited Ketu-first order.
- Civil input has whole-minute precision. Historical timezone offsets are rounded to minutes. Intl supplies timezone rules, which can differ across runtimes and timezone database versions.
- Daily panchang is evaluated at sunrise. `panchangAt` is the separate birth-instant calculation. Rise/set times use the solar upper limb, standard refraction and a sea-level observer.
- Sade Sati uses Saturn in the twelfth, first or second sign from the Moon; Dhaiya uses the fourth or eighth. Retrograde exits and returns remain separate spans. Each call scans the fixed interval; applications can retain a result instead of repeating the scan.
- Guna milan preserves the inherited asymmetric scoring tables. Note keys identify calculation conditions; website explanatory prose has been removed. Scores do not establish relationship outcomes.

## Limits and regression coverage

There is no Shadbala and no divisional chart beyond D9. Mean nodes are the default. Sunrise has a working tolerance of plus or minus 1 minute under the stated sea-level model, not a guarantee for terrain, elevation or unusual weather. Minute-rounded birth times, historical offset rounding and an uncertain birth time can move a chart across a boundary. Polar dates can lack the required solar events. The public benchmark targets 1900 through 2050; the inherited Saturn scan covers 1950 through 2100.

A polar ascendant branch was corrected during extraction: the selected horizon intersection must be rising in the east. The original atan2 branch could select the opposite intersection at high latitude. This is the only calculation change. The site itself has not been changed. Regression tests check eastward horizon position and increasing altitude in both hemispheres. All other calculations preserve the extracted arithmetic.

`npm test` runs calculation assertions ported from the Pocket Jyotish website's engine, milan, panchang, Sade Sati and mahadasha checks, plus the polar ascendant regression. Website HTML, storage and controller assertions are omitted. Before release, the extracted code was also compared against the original in-site implementation on 250 seeded random inputs, and kundli, panchang, hora, choghadiya, dasha and milan results matched exactly. That comparison needs the original site files, so it is not part of this repository.

The 200-pair milan fixture is cross-checked against published Drik Panchang horoscope-match output on 3 Nov 2026, according to the inherited test record. It preserves Moon longitudes and numeric expected scores rather than birth records. The old browsing session is not recoverable, and this run does not claim fresh verification of those historical outputs. Stored fractional sums differ from the truncated total display described in that record.

## Independent benchmark

[BENCHMARK.md](BENCHMARK.md) contains the measured results, tolerances, failed cases and exact settings. Known weak spots are listed there too: Saturn sign-change times are only within 10 minutes in 37 of 85 events (the dates are right), true-node Rahu is compared separately and is within 10 arcseconds in only 62.6 percent of cases, and Mahadasha start dates fall within one day in 97.6 percent of cases. The harness generates seeded reference charts with the external Swiss Ephemeris oracle, compares planets, ascendant, discrete boundaries, birth-instant panchang, dasha, Saturn ingresses and solar events, and repeats the stored milan cross-check.

`pyswisseph` is AGPL-licensed and is used only as a separately installed development oracle. It is never bundled or declared as a package dependency. The npm artifact excludes the benchmark harness and references. The package includes only the MIT runtime dependency. See [benchmark/README.md](benchmark/README.md) for reproducible commands and the Moshier/data-file distinction.

The benchmark measures numerical agreement. It does not measure astrological validity or prediction quality.

### Reproduce the benchmark

The saved reference is in `benchmark/reference/charts.json`, so you can re-run the comparison with Node only:

```sh
npm run build
node benchmark/run_benchmark.mjs
```

This rewrites `benchmark/results.json` and `BENCHMARK.md`. To regenerate the reference itself, install the Swiss Ephemeris Python binding in a separate virtual environment outside this repo. It is AGPL licensed, so it is a development tool only and is never bundled or committed here:

```sh
python3 -m venv /tmp/oracle-env
. /tmp/oracle-env/bin/activate
pip install pyswisseph==2.10.3.2
python benchmark/generate_reference.py
node benchmark/run_benchmark.mjs
```

The seed is fixed (20261127), so the generated charts are identical on every run. Details are in [benchmark/README.md](benchmark/README.md).

## Examples and license

Run `node examples/node-kundli.mjs` or `node examples/node-panchang.mjs`. Serve this directory over HTTP and open `examples/browser.html` to use native ESM with no build step, CDN or network dependency beyond your local server.

MIT, copyright Maahir Madhok and Pocket Jyotish contributors. See [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Traditional names are retained as names, without website or marketing text.

## हिन्दी सार

यह [Pocket Jyotish](https://pocketjyotish.in) का खुला (ओपन-सोर्स, MIT लाइसेंस) गणना पैकेज है। इससे लग्न, ग्रहों की स्थिति, नक्षत्र, पंचांग, विम्शोत्तरी दशा, साढ़ेसाती और गुण मिलान की गणना की जा सकती है। यह ब्राउज़र और Node में चलता है। जन्म का समय पूरे मिनट में दें और समय क्षेत्र सही चुनें। गणना की सीमाएँ तथा स्वतंत्र तुलना के परिणाम BENCHMARK.md में दिए गए हैं। यह तुलना ज्योतिषीय भविष्यवाणी की सत्यता का प्रमाण नहीं है।
