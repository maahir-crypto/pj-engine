# Numerical agreement benchmark

Date: 2026-11-27. pj-engine 0.1.0. Astronomy Engine 2.1.19. pyswisseph distribution 2.10.3.2, build 20230604, Swiss Ephemeris 2.10.03, Python 3.12.14.

Oracle: Moshier. No Swiss ephemeris data files were downloaded in this run because sandbox DNS failed. The reference generator checks returned ephemeris flags to reject silent fallback.

There are 418 charts: 350 seed-fixed, stratified uniform cases over 1900 through 2050, plus 68 edge cases. Coordinates are manually written representative test locations for 45 Indian and 25 other cities. They are test inputs, not a gazetteer.

Agreement with Swiss Ephemeris measures numerical agreement, not astrological validity or prediction quality.

## Settings and comparison

SIDM_LAHIRI; apparent, geocentric positions; mean node primary. True node is a separate row and does not alter the primary comparison. Planet positions use calc_ut with the selected ephemeris flag plus FLG_SIDEREAL. No FLG_TRUEPOS, J2000 or NONUT flags are used. The package subtracts true Lahiri ayanamsa from apparent true-equinox longitudes; mean nodes subtract mean ayanamsa. The Swiss implementation remains independent, so small differences in nutation, precession, Delta T and node models are measured rather than removed.

Ascendant reference: tropical swe.houses_ex ascendant minus swe.get_ayanamsa_ex_ut true Lahiri ayanamsa. Equal houses are requested only to avoid polar Placidus failures; no house cusp is compared. The package uses its existing analytic ascendant and whole-sign house assignment.

Birth inputs have whole-minute precision. Python zoneinfo offsets are rounded to whole minutes to match the existing Intl conversion, including pre-standard-time offsets. Every UTC instant and offset is checked against the package before any metric is accepted. Cases with different timezone database results are excluded and listed below. The explicit 1944 Indian war-time case is included only because both sides agree on +06:30. No ambiguous DST or nonexistent civil time is an intentional fixture.

Timezone exclusions: 1. [{"id":110,"input":{"year":1947,"month":11,"day":18,"hour":5,"minute":4,"lat":64.15,"lon":-21.94,"tz":"Atlantic/Reykjavik"},"packageOffset":0,"referenceOffset":-60}]

Panchang indices and tithi ends are measured at the birth instant, using panchangAt, rather than the daily API sunrise. Tithi and karana use Moon minus Sun; yoga uses their sidereal sum. The karana index is the half-tithi slot, 0 through 59, rather than the repeating traditional name index. Mahadasha compares the start of each of nine periods, with 365.25 days per year, against an independently implemented timeline from the oracle Moon. Periods are compared by sequence position; differing starting lords are retained in worst-case details.

Sunrise and sunset use sea-level coordinates, solar upper limb and refraction. Swiss rise_trans uses 1013.25 hPa and 15 C. Astronomy Engine uses SearchRiseSet defaults. Sunset is searched after sunrise, and next sunrise is required, matching the daily API. Different atmosphere and refraction models remain a limitation.

Polar or out-of-window reference cases: 1; package missing when reference exists: 0; solar availability disagreements: 0. These cases are excluded from timing distributions and are disclosed here.

Saturn ingresses cover 1950 through 2050, including retrograde re-entries. Oracle scanner: two-day steps, then binary search. Package scanner: unchanged two-day steps and one-second stopping rule. Matched 85 of 85; missing references: 0; extra package events: 0. The timing pass rate is conditional on matching; missing and extra events are separately reported.

Boundary stress: 34 body cases lie within 10 arcseconds of a sign, nakshatra or pada boundary in the reference. They remain in all exact-match statistics.

Guna milan is a published-output cross-check, not a Swiss metric: cross-checked against published Drik Panchang horoscope-match output on 3 Nov 2026, according to the earlier project test record. This run repeats those stored expectations; the historical session cannot be independently recovered. The source record also says displayed Drik totals were truncated, while stored totals preserve fractional sums. All eight individual scores and the stored sum must match. The fixtures contain Moon longitudes and scores only.

## Polar ascendant correction

One polar fixture from the original implementation selected the setting intersection of the ecliptic and horizon: 1943-10-07 14:45, latitude 69.65, longitude 18.96, Europe/Oslo. Original sidereal ascendant: 217.8193236261092 degrees; Swiss: 37.819324912322124 degrees. A separate horizontal projection placed the original at azimuth 181.6877131570131 degrees, west of south, and the opposite point at azimuth 1.6877118956831454 degrees, east of north. The package now checks the east component of the ecliptic unit vector and selects the eastern intersection. A regression checks rising altitude and horizon position for 24 hours in each hemisphere. This geometric check establishes a branch error independently of fitting Swiss results. The same correction has been applied to the Pocket Jyotish website. The results below include that correction.

## Results

Percentiles use nearest rank. Mismatch rows encode agreement as 0 and disagreement as 1. Tolerances were fixed before the run and were not widened after failures.

| Metric | Cases | Unit | Median | P95 | Max | Tolerance | Pass rate |
|---|---:|---|---:|---:|---:|---:|---:|
| Sun | 417 | arcsec | 0.329672 | 1.061 | 1.710418 | <= 10 | 417/417 (100.00%) |
| Planets and mean nodes | 3753 | arcsec | 0.686969 | 5.684989 | 13.726578 | <= 10 | 3737/3753 (99.57%) |
| Rashi all nine bodies | 3753 | mismatch | 0 | 0 | 1 | <= 0 | 3752/3753 (99.97%) |
| Nakshatra all nine bodies | 3753 | mismatch | 0 | 0 | 0 | <= 0 | 3753/3753 (100.00%) |
| Pada all nine bodies | 3753 | mismatch | 0 | 0 | 1 | <= 0 | 3752/3753 (99.97%) |
| Moon | 417 | arcsec | 1.052197 | 7.416438 | 10.605558 | <= 10 | 414/417 (99.28%) |
| Mars | 417 | arcsec | 0.936352 | 4.312959 | 8.977965 | <= 10 | 417/417 (100.00%) |
| Mercury | 417 | arcsec | 1.544833 | 5.077994 | 7.910269 | <= 10 | 417/417 (100.00%) |
| Jupiter | 417 | arcsec | 2.277926 | 6.452202 | 9.809203 | <= 10 | 417/417 (100.00%) |
| Venus | 417 | arcsec | 0.89687 | 5.240659 | 13.726578 | <= 10 | 411/417 (98.56%) |
| Saturn | 417 | arcsec | 2.53038 | 8.427258 | 12.198331 | <= 10 | 410/417 (98.32%) |
| Rahu | 417 | arcsec | 0.080248 | 0.11826 | 0.119627 | <= 10 | 417/417 (100.00%) |
| Ketu | 417 | arcsec | 0.080248 | 0.11826 | 0.119627 | <= 10 | 417/417 (100.00%) |
| Moon nakshatra | 417 | mismatch | 0 | 0 | 0 | <= 0 | 417/417 (100.00%) |
| Moon pada | 417 | mismatch | 0 | 0 | 1 | <= 0 | 416/417 (99.76%) |
| Rahu true separately | 417 | arcsec | 7.213506 | 23.870671 | 38.836532 | <= 10 | 261/417 (62.59%) |
| Ascendant | 417 | arcsec | 0.132645 | 0.256235 | 2.317086 | <= 60 | 417/417 (100.00%) |
| Ascendant latitude below 30 | 283 | arcsec | 0.132645 | 0.256235 | 2.317086 | <= 60 | 283/283 (100.00%) |
| Ascendant rashi | 417 | mismatch | 0 | 0 | 0 | <= 0 | 417/417 (100.00%) |
| tithi | 417 | mismatch | 0 | 0 | 0 | <= 0 | 417/417 (100.00%) |
| karana | 417 | mismatch | 0 | 0 | 0 | <= 0 | 417/417 (100.00%) |
| yoga | 417 | mismatch | 0 | 0 | 0 | <= 0 | 417/417 (100.00%) |
| Tithi end | 417 | minutes | 0.039567 | 0.24234 | 0.318179 | <= 1 | 417/417 (100.00%) |
| Mahadasha start | 3753 | days | 0.098561 | 0.699695 | 1.390497 | <= 1 | 3663/3753 (97.60%) |
| Sunrise | 416 | seconds | 1.927228 | 3.160813 | 11.385495 | <= 60 | 416/416 (100.00%) |
| Sunset | 416 | seconds | 1.905246 | 3.038768 | 12.21678 | <= 60 | 416/416 (100.00%) |
| Ascendant latitude 30 to below 60 | 120 | arcsec | 0.133769 | 0.255612 | 0.448858 | <= 60 | 120/120 (100.00%) |
| Ascendant latitude 60 and above | 14 | arcsec | 0.112123 | 0.239908 | 0.239908 | <= 60 | 14/14 (100.00%) |
| Saturn sign ingress | 85 | minutes | 11.975626 | 38.256254 | 141.720868 | <= 10 | 37/85 (43.53%) |
| Guna milan inherited pairs | 200 | mismatch | 0 | 0 | 0 | <= 0 | 200/200 (100.00%) |

## Worst cases and interpretation

All rows below retain measured failures. Planet and ascendant differences can include approximation, nutation and Delta T differences. Moon errors near a discrete boundary can change nakshatra, pada or a starting dasha lord. Long dasha timing errors amplify small Moon longitude differences. True-node definitions and the lunar state-vector approximation can diverge from the Swiss true node. Ingress worst cases include the package angular difference at the reference crossing and its local speed, so the amplification of angular error during slow Saturn motion can be inspected. These are candidate explanations, not isolated causal measurements. Sunrise differences can reflect refraction and atmospheric assumptions. No calculation was changed to fit the oracle.

### Sun

- Error 1.710418 arcsec: {"id":353,"input":{"year":2050,"month":12,"day":31,"hour":23,"minute":59,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"}}
- Error 1.662834 arcsec: {"id":164,"input":{"year":1971,"month":2,"day":5,"hour":21,"minute":47,"lat":17.69,"lon":83.22,"tz":"Asia/Kolkata"}}
- Error 1.492087 arcsec: {"id":4,"input":{"year":1901,"month":10,"day":19,"hour":14,"minute":44,"lat":40.71,"lon":-74.01,"tz":"America/New_York"}}

### Planets and mean nodes

- Error 13.726578 arcsec: {"id":219,"input":{"year":1994,"month":10,"day":21,"hour":18,"minute":4,"lat":-36.85,"lon":174.76,"tz":"Pacific/Auckland"},"body":"Venus"}
- Error 13.52319 arcsec: {"id":264,"input":{"year":2014,"month":2,"day":10,"hour":2,"minute":38,"lat":25.2,"lon":55.27,"tz":"Asia/Dubai"},"body":"Venus"}
- Error 13.416725 arcsec: {"id":23,"input":{"year":1910,"month":3,"day":16,"hour":1,"minute":48,"lat":22.72,"lon":75.86,"tz":"Asia/Kolkata"},"body":"Venus"}

### Rashi all nine bodies

- Error 1 mismatch: {"id":394,"input":{"year":1981,"month":2,"day":3,"hour":11,"minute":52,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"},"body":"Moon"}
- Error 0 mismatch: {"id":0,"input":{"year":1900,"month":1,"day":6,"hour":19,"minute":31,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"},"body":"Sun"}
- Error 0 mismatch: {"id":0,"input":{"year":1900,"month":1,"day":6,"hour":19,"minute":31,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"},"body":"Moon"}

### Nakshatra all nine bodies

- Error 0 mismatch: {"id":0,"input":{"year":1900,"month":1,"day":6,"hour":19,"minute":31,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"},"body":"Sun"}
- Error 0 mismatch: {"id":0,"input":{"year":1900,"month":1,"day":6,"hour":19,"minute":31,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"},"body":"Moon"}
- Error 0 mismatch: {"id":0,"input":{"year":1900,"month":1,"day":6,"hour":19,"minute":31,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"},"body":"Mars"}

### Pada all nine bodies

- Error 1 mismatch: {"id":394,"input":{"year":1981,"month":2,"day":3,"hour":11,"minute":52,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"},"body":"Moon"}
- Error 0 mismatch: {"id":0,"input":{"year":1900,"month":1,"day":6,"hour":19,"minute":31,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"},"body":"Sun"}
- Error 0 mismatch: {"id":0,"input":{"year":1900,"month":1,"day":6,"hour":19,"minute":31,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"},"body":"Moon"}

### Moon

- Error 10.605558 arcsec: {"id":349,"input":{"year":2050,"month":11,"day":26,"hour":0,"minute":19,"lat":15.5,"lon":73.83,"tz":"Asia/Kolkata"}}
- Error 10.28828 arcsec: {"id":348,"input":{"year":2050,"month":3,"day":19,"hour":3,"minute":41,"lat":26.91,"lon":75.79,"tz":"Asia/Kolkata"}}
- Error 10.102413 arcsec: {"id":335,"input":{"year":2044,"month":12,"day":4,"hour":21,"minute":58,"lat":34.08,"lon":74.8,"tz":"Asia/Kolkata"}}

### Mars

- Error 8.977965 arcsec: {"id":314,"input":{"year":2035,"month":8,"day":20,"hour":10,"minute":4,"lat":12.97,"lon":77.59,"tz":"Asia/Kolkata"}}
- Error 8.643068 arcsec: {"id":17,"input":{"year":1907,"month":8,"day":24,"hour":6,"minute":2,"lat":23.34,"lon":85.31,"tz":"Asia/Kolkata"}}
- Error 7.527359 arcsec: {"id":131,"input":{"year":1956,"month":9,"day":17,"hour":15,"minute":43,"lat":19.08,"lon":72.88,"tz":"Asia/Kolkata"}}

### Mercury

- Error 7.910269 arcsec: {"id":54,"input":{"year":1923,"month":6,"day":5,"hour":22,"minute":12,"lat":25.2,"lon":55.27,"tz":"Asia/Dubai"}}
- Error 7.069737 arcsec: {"id":163,"input":{"year":1970,"month":7,"day":6,"hour":2,"minute":53,"lat":22.72,"lon":75.86,"tz":"Asia/Kolkata"}}
- Error 7.010421 arcsec: {"id":62,"input":{"year":1927,"month":3,"day":3,"hour":2,"minute":28,"lat":23.83,"lon":91.29,"tz":"Asia/Kolkata"}}

### Jupiter

- Error 9.809203 arcsec: {"id":251,"input":{"year":2008,"month":8,"day":31,"hour":22,"minute":33,"lat":25.32,"lon":82.97,"tz":"Asia/Kolkata"}}
- Error 9.435524 arcsec: {"id":114,"input":{"year":1949,"month":7,"day":24,"hour":13,"minute":29,"lat":27.08,"lon":93.61,"tz":"Asia/Kolkata"}}
- Error 8.608779 arcsec: {"id":238,"input":{"year":2002,"month":12,"day":31,"hour":6,"minute":58,"lat":26.14,"lon":91.74,"tz":"Asia/Kolkata"}}

### Venus

- Error 13.726578 arcsec: {"id":219,"input":{"year":1994,"month":10,"day":21,"hour":18,"minute":4,"lat":-36.85,"lon":174.76,"tz":"Pacific/Auckland"}}
- Error 13.52319 arcsec: {"id":264,"input":{"year":2014,"month":2,"day":10,"hour":2,"minute":38,"lat":25.2,"lon":55.27,"tz":"Asia/Dubai"}}
- Error 13.416725 arcsec: {"id":23,"input":{"year":1910,"month":3,"day":16,"hour":1,"minute":48,"lat":22.72,"lon":75.86,"tz":"Asia/Kolkata"}}

### Saturn

- Error 12.198331 arcsec: {"id":235,"input":{"year":2001,"month":8,"day":18,"hour":16,"minute":35,"lat":17.39,"lon":78.49,"tz":"Asia/Kolkata"}}
- Error 11.32113 arcsec: {"id":236,"input":{"year":2002,"month":3,"day":3,"hour":4,"minute":10,"lat":20.3,"lon":85.82,"tz":"Asia/Kolkata"}}
- Error 11.159643 arcsec: {"id":405,"input":{"year":2001,"month":2,"day":1,"hour":9,"minute":17,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"}}

### Rahu

- Error 0.119627 arcsec: {"id":278,"input":{"year":2019,"month":12,"day":31,"hour":21,"minute":38,"lat":26.91,"lon":75.79,"tz":"Asia/Kolkata"}}
- Error 0.11961 arcsec: {"id":277,"input":{"year":2019,"month":8,"day":1,"hour":3,"minute":32,"lat":52.52,"lon":13.41,"tz":"Europe/Berlin"}}
- Error 0.119596 arcsec: {"id":276,"input":{"year":2019,"month":6,"day":24,"hour":1,"minute":37,"lat":22.31,"lon":73.18,"tz":"Asia/Kolkata"}}

### Ketu

- Error 0.119627 arcsec: {"id":278,"input":{"year":2019,"month":12,"day":31,"hour":21,"minute":38,"lat":26.91,"lon":75.79,"tz":"Asia/Kolkata"}}
- Error 0.11961 arcsec: {"id":277,"input":{"year":2019,"month":8,"day":1,"hour":3,"minute":32,"lat":52.52,"lon":13.41,"tz":"Europe/Berlin"}}
- Error 0.119596 arcsec: {"id":276,"input":{"year":2019,"month":6,"day":24,"hour":1,"minute":37,"lat":22.31,"lon":73.18,"tz":"Asia/Kolkata"}}

### Moon nakshatra

- Error 0 mismatch: {"id":0,"input":{"year":1900,"month":1,"day":6,"hour":19,"minute":31,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"}}
- Error 0 mismatch: {"id":1,"input":{"year":1900,"month":7,"day":18,"hour":19,"minute":13,"lat":23.73,"lon":92.72,"tz":"Asia/Kolkata"}}
- Error 0 mismatch: {"id":2,"input":{"year":1900,"month":12,"day":29,"hour":19,"minute":0,"lat":-1.29,"lon":36.82,"tz":"Africa/Nairobi"}}

### Moon pada

- Error 1 mismatch: {"id":394,"input":{"year":1981,"month":2,"day":3,"hour":11,"minute":52,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"}}
- Error 0 mismatch: {"id":0,"input":{"year":1900,"month":1,"day":6,"hour":19,"minute":31,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"}}
- Error 0 mismatch: {"id":1,"input":{"year":1900,"month":7,"day":18,"hour":19,"minute":13,"lat":23.73,"lon":92.72,"tz":"Asia/Kolkata"}}

### Rahu true separately

- Error 38.836532 arcsec: {"id":293,"input":{"year":2026,"month":7,"day":21,"hour":5,"minute":51,"lat":60.17,"lon":24.94,"tz":"Europe/Helsinki"}}
- Error 36.004908 arcsec: {"id":320,"input":{"year":2038,"month":4,"day":15,"hour":2,"minute":23,"lat":64.15,"lon":-21.94,"tz":"Atlantic/Reykjavik"}}
- Error 32.129518 arcsec: {"id":282,"input":{"year":2021,"month":10,"day":15,"hour":2,"minute":15,"lat":-1.29,"lon":36.82,"tz":"Africa/Nairobi"}}

### Ascendant

- Error 2.317086 arcsec: {"id":348,"input":{"year":2050,"month":3,"day":19,"hour":3,"minute":41,"lat":26.91,"lon":75.79,"tz":"Asia/Kolkata"}}
- Error 1.999645 arcsec: {"id":349,"input":{"year":2050,"month":11,"day":26,"hour":0,"minute":19,"lat":15.5,"lon":73.83,"tz":"Asia/Kolkata"}}
- Error 1.825568 arcsec: {"id":353,"input":{"year":2050,"month":12,"day":31,"hour":23,"minute":59,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"}}

### Ascendant latitude below 30

- Error 2.317086 arcsec: {"id":348,"input":{"year":2050,"month":3,"day":19,"hour":3,"minute":41,"lat":26.91,"lon":75.79,"tz":"Asia/Kolkata"}}
- Error 1.999645 arcsec: {"id":349,"input":{"year":2050,"month":11,"day":26,"hour":0,"minute":19,"lat":15.5,"lon":73.83,"tz":"Asia/Kolkata"}}
- Error 1.825568 arcsec: {"id":353,"input":{"year":2050,"month":12,"day":31,"hour":23,"minute":59,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"}}

### Ascendant rashi

- Error 0 mismatch: {"id":0,"input":{"year":1900,"month":1,"day":6,"hour":19,"minute":31,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"}}
- Error 0 mismatch: {"id":1,"input":{"year":1900,"month":7,"day":18,"hour":19,"minute":13,"lat":23.73,"lon":92.72,"tz":"Asia/Kolkata"}}
- Error 0 mismatch: {"id":2,"input":{"year":1900,"month":12,"day":29,"hour":19,"minute":0,"lat":-1.29,"lon":36.82,"tz":"Africa/Nairobi"}}

### tithi

- Error 0 mismatch: {"id":0,"input":{"year":1900,"month":1,"day":6,"hour":19,"minute":31,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"}}
- Error 0 mismatch: {"id":1,"input":{"year":1900,"month":7,"day":18,"hour":19,"minute":13,"lat":23.73,"lon":92.72,"tz":"Asia/Kolkata"}}
- Error 0 mismatch: {"id":2,"input":{"year":1900,"month":12,"day":29,"hour":19,"minute":0,"lat":-1.29,"lon":36.82,"tz":"Africa/Nairobi"}}

### karana

- Error 0 mismatch: {"id":0,"input":{"year":1900,"month":1,"day":6,"hour":19,"minute":31,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"}}
- Error 0 mismatch: {"id":1,"input":{"year":1900,"month":7,"day":18,"hour":19,"minute":13,"lat":23.73,"lon":92.72,"tz":"Asia/Kolkata"}}
- Error 0 mismatch: {"id":2,"input":{"year":1900,"month":12,"day":29,"hour":19,"minute":0,"lat":-1.29,"lon":36.82,"tz":"Africa/Nairobi"}}

### yoga

- Error 0 mismatch: {"id":0,"input":{"year":1900,"month":1,"day":6,"hour":19,"minute":31,"lat":28.61,"lon":77.21,"tz":"Asia/Kolkata"}}
- Error 0 mismatch: {"id":1,"input":{"year":1900,"month":7,"day":18,"hour":19,"minute":13,"lat":23.73,"lon":92.72,"tz":"Asia/Kolkata"}}
- Error 0 mismatch: {"id":2,"input":{"year":1900,"month":12,"day":29,"hour":19,"minute":0,"lat":-1.29,"lon":36.82,"tz":"Africa/Nairobi"}}

### Tithi end

- Error 0.318179 minutes: {"id":343,"input":{"year":2047,"month":12,"day":30,"hour":17,"minute":53,"lat":30.04,"lon":31.24,"tz":"Africa/Cairo"}}
- Error 0.316714 minutes: {"id":329,"input":{"year":2041,"month":12,"day":19,"hour":18,"minute":33,"lat":40.42,"lon":-3.7,"tz":"Europe/Madrid"}}
- Error 0.299123 minutes: {"id":346,"input":{"year":2049,"month":6,"day":7,"hour":0,"minute":54,"lat":22.31,"lon":73.18,"tz":"Asia/Kolkata"}}

### Mahadasha start

- Error 1.390497 days: {"id":342,"input":{"year":2047,"month":10,"day":24,"hour":17,"minute":36,"lat":23.83,"lon":91.29,"tz":"Asia/Kolkata"},"period":0,"lord":"Venus","referenceLord":"Venus"}
- Error 1.390497 days: {"id":342,"input":{"year":2047,"month":10,"day":24,"hour":17,"minute":36,"lat":23.83,"lon":91.29,"tz":"Asia/Kolkata"},"period":1,"lord":"Sun","referenceLord":"Sun"}
- Error 1.390497 days: {"id":342,"input":{"year":2047,"month":10,"day":24,"hour":17,"minute":36,"lat":23.83,"lon":91.29,"tz":"Asia/Kolkata"},"period":2,"lord":"Moon","referenceLord":"Moon"}

### Sunrise

- Error 11.385495 seconds: {"id":241,"input":{"year":2004,"month":5,"day":10,"hour":11,"minute":5,"lat":69.65,"lon":18.96,"tz":"Europe/Oslo"}}
- Error 6.501924 seconds: {"id":311,"input":{"year":2034,"month":4,"day":24,"hour":14,"minute":25,"lat":69.65,"lon":18.96,"tz":"Europe/Oslo"}}
- Error 5.951342 seconds: {"id":223,"input":{"year":1996,"month":6,"day":21,"hour":5,"minute":49,"lat":60.17,"lon":24.94,"tz":"Europe/Helsinki"}}

### Sunset

- Error 12.21678 seconds: {"id":241,"input":{"year":2004,"month":5,"day":10,"hour":11,"minute":5,"lat":69.65,"lon":18.96,"tz":"Europe/Oslo"}}
- Error 6.539314 seconds: {"id":311,"input":{"year":2034,"month":4,"day":24,"hour":14,"minute":25,"lat":69.65,"lon":18.96,"tz":"Europe/Oslo"}}
- Error 5.795502 seconds: {"id":250,"input":{"year":2007,"month":11,"day":27,"hour":12,"minute":12,"lat":64.15,"lon":-21.94,"tz":"Atlantic/Reykjavik"}}

### Ascendant latitude 30 to below 60

- Error 0.448858 arcsec: {"id":162,"input":{"year":1970,"month":1,"day":5,"hour":10,"minute":50,"lat":59.91,"lon":10.75,"tz":"Europe/Oslo"}}
- Error 0.345858 arcsec: {"id":155,"input":{"year":1967,"month":3,"day":23,"hour":7,"minute":37,"lat":51.51,"lon":-0.13,"tz":"Europe/London"}}
- Error 0.310303 arcsec: {"id":56,"input":{"year":1924,"month":5,"day":9,"hour":6,"minute":13,"lat":43.65,"lon":-79.38,"tz":"America/Toronto"}}

### Ascendant latitude 60 and above

- Error 0.239908 arcsec: {"id":223,"input":{"year":1996,"month":6,"day":21,"hour":5,"minute":49,"lat":60.17,"lon":24.94,"tz":"Europe/Helsinki"}}
- Error 0.200104 arcsec: {"id":293,"input":{"year":2026,"month":7,"day":21,"hour":5,"minute":51,"lat":60.17,"lon":24.94,"tz":"Europe/Helsinki"}}
- Error 0.177686 arcsec: {"id":180,"input":{"year":1978,"month":1,"day":23,"hour":18,"minute":48,"lat":64.15,"lon":-21.94,"tz":"Atlantic/Reykjavik"}}

### Saturn sign ingress

- Error 141.720868 minutes: {"referenceTime":"2041-01-27T21:42:06.909Z","packageTime":"2041-01-27T19:20:23.657Z","fromSign":5,"sign":6,"packageSpeedDegreesPerDay":0.008484406329273497,"packageLongitudeErrorAtReferenceArcseconds":3.03754440915327}
- Error 140.071236 minutes: {"referenceTime":"2041-02-06T09:22:24.114Z","packageTime":"2041-02-06T11:42:28.388Z","fromSign":6,"sign":5,"packageSpeedDegreesPerDay":-0.008433205155995438,"packageLongitudeErrorAtReferenceArcseconds":2.983045656583272}
- Error 52.806436 minutes: {"referenceTime":"2027-10-20T01:42:13.815Z","packageTime":"2027-10-20T00:49:25.429Z","fromSign":0,"sign":11,"packageSpeedDegreesPerDay":-0.07961071887984872,"packageLongitudeErrorAtReferenceArcseconds":10.510745090005003}

### Guna milan inherited pairs

- Error 0 mismatch: {"id":0}
- Error 0 mismatch: {"id":1}
- Error 0 mismatch: {"id":2}

## Reproduce

Install the external development oracle in a separate environment: `python -m pip install pyswisseph==2.10.3.2`. It is AGPL-licensed and is not a runtime or development dependency in package.json, is not vendored here and is excluded from the npm artifact. Only numerical outputs and this MIT harness are distributed.

From the package root run:

```sh
npm run build
python benchmark/generate_reference.py
node benchmark/run_benchmark.mjs
npm test
```

The default generator deliberately selects Moshier for reproducibility without data files. To run with Swiss binary data files, supply `--ephe /path/to/ephe`; their hashes and returned flags are recorded. This produces a different benchmark and must be reported as a new run. See [benchmark/README.md](benchmark/README.md) and machine-readable [benchmark/results.json](benchmark/results.json).

Primary settings documentation: [Swiss Ephemeris programming manual](https://www.astro.com/swisseph/swephprg.htm). Matching interface: [Drik Panchang](https://www.drikpanchang.com/jyotisha/horoscope-match/horoscope-match.html). Runtime upstream: [Astronomy Engine](https://github.com/cosinekitty/astronomy). Oracle distribution: [pyswisseph](https://pypi.org/project/pyswisseph/).
