# Reproducing the reference and report

Run these commands from the package root with Python 3.12 and Node 18 or later:

```sh
python -m venv /path/to/separate-oracle-env
. /path/to/separate-oracle-env/bin/activate
python -m pip install pyswisseph==2.10.3.2
npm run build
python benchmark/generate_reference.py
node benchmark/run_benchmark.mjs
npm test
```

The generator is offline after oracle installation. It writes `reference/charts.json`, containing synthetic inputs and numerical reference outputs. The runner writes `results.json` and `../BENCHMARK.md`. The fixed seed is 20261127. Timings and settings, including exclusions, are documented in the generated report. Reference generation does not call or copy the package calculations.

The source package uses no Python dependency. Swiss Ephemeris and its pyswisseph binding are AGPL-licensed and are external development tools only. Neither their source, binaries nor data files are distributed here or included in the npm artifact. The harness is original MIT code that invokes the installed binding. Numerical reference outputs are saved so readers can run the Node comparison without installing the oracle.

The default is Moshier, explicitly requested and checked through return flags. Downloads of Swiss data files failed in the extraction sandbox. A different reference can be generated with:

```sh
python benchmark/generate_reference.py --ephe /path/to/swiss-ephemeris-files
node benchmark/run_benchmark.mjs
```

That directory must contain `sepl_18.se1` and `semo_18.se1`. SHA-256 hashes and the ephemeris mode are saved. No asteroid metric needs `seas_18.se1`. Never mix results from different oracle modes under one benchmark label.

The extraction environment used the cached pyswisseph 2.10.3.2 source distribution, CPython 3.12.14 headers and GCC. The optional swephelp extension was disabled because the C++ compiler was absent. The core binding and bundled Swiss C library were built unchanged. The oracle reported Swiss version 2.10.03 and binding build 20230604. No native component is used by pj-engine.

Coordinates in `cities.json` are manually specified, rounded test points, not imported city data. Python zoneinfo and Node Intl supply IANA rules. Their historic Reykjavik disagreement is excluded explicitly rather than letting different UTC instants contaminate the astronomy comparison. The 1944 India war-time test is retained because both agree. Deliberate Moon boundary cases use the oracle crossing rounded down and up to the nearest supported civil minute. A minute can span several arcseconds, so the report separately counts cases actually within the boundary window.

The ascendant reference subtracts true Lahiri ayanamsa from a tropical `houses_ex` ascendant. Equal houses avoid polar Placidus failure; no cusps are compared. Sunrise and sunset use upper limbs, sea level, 1013.25 hPa and 15 C on the Swiss side. Missing solar events are reported separately. Planetary, dasha and panchang reference outputs use UT Julian dates from the shared, rounded-offset UTC instant. The libraries retain their own Delta T models.

The inherited Drik Panchang check compares eight koota scores and their sum. It is not an independent Swiss comparison and is not a new online verification of the historical session. The earlier project record says the displayed total was truncated while individual kootas agreed. Fixtures retain fractional sums.

Sources: [Swiss programming interface](https://www.astro.com/swisseph/swephprg.htm), [pyswisseph project](https://pypi.org/project/pyswisseph/), [official Swiss data directory](https://github.com/aloistr/swisseph/tree/master/ephe), [Astronomy Engine](https://github.com/cosinekitty/astronomy).
