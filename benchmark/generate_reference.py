#!/usr/bin/env python3
"""Generate numerical references using an external, development-only oracle.
Requires pyswisseph 2.10.3.2. No oracle implementation is distributed here.
"""
import argparse
import datetime as dt
import hashlib
import json
import math
import platform
import random
from pathlib import Path
from zoneinfo import ZoneInfo
import swisseph as swe

ROOT = Path(__file__).resolve().parent
EPOCH = dt.datetime(1970, 1, 1, tzinfo=dt.timezone.utc)
JD0 = 2440587.5
DAY = 86400000
YEAR = 365.25 * DAY
ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']
YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17]
BODIES = dict(Sun=swe.SUN, Moon=swe.MOON, Mars=swe.MARS, Mercury=swe.MERCURY,
              Jupiter=swe.JUPITER, Venus=swe.VENUS, Saturn=swe.SATURN, Rahu=swe.MEAN_NODE)
FLAGS = swe.FLG_MOSEPH
swe.set_sid_mode(swe.SIDM_LAHIRI)

def lon(body, jd):
    values, returned = swe.calc_ut(jd, body, FLAGS | swe.FLG_SIDEREAL)
    if body not in (swe.MEAN_NODE, swe.TRUE_NODE) and returned & 7 != FLAGS:
        raise RuntimeError('Oracle ephemeris fallback differs from selected mode')
    return values[0]

def elong(jd):
    return (lon(swe.MOON, jd) - lon(swe.SUN, jd)) % 360

def crossing(fn, target, start, step=0.08, limit=3):
    lo = start
    for _ in range(math.ceil(limit / step)):
        hi = lo + step
        a, b = fn(lo), fn(hi)
        if (target - a) % 360 <= (b - a) % 360 < 180:
            for _ in range(40):
                mid = (lo + hi) / 2
                if (target - fn(lo)) % 360 <= (fn(mid) - fn(lo)) % 360 < 180:
                    hi = mid
                else:
                    lo = mid
            return (lo + hi) / 2
        lo = hi
    raise RuntimeError('Crossing not bracketed')

def ms(jd):
    return (jd - JD0) * DAY

def wall_input(local, city):
    name, lat, lng, tz = city
    return dict(year=local.year, month=local.month, day=local.day, hour=local.hour,
                minute=local.minute, lat=lat, lon=lng, tz=tz)

def utc_of(x):
    wall = dt.datetime(x['year'], x['month'], x['day'], x['hour'], x['minute'])
    offset = wall.replace(tzinfo=ZoneInfo(x['tz'])).utcoffset().total_seconds()
    # The site rounds historic sub-minute offsets, and accepts minute birth times.
    minutes = math.floor(offset / 60 + 0.5)
    return (wall.replace(tzinfo=dt.timezone.utc) - dt.timedelta(minutes=minutes)), minutes

def reference(x, index):
    utc, offset = utc_of(x)
    jd = JD0 + (utc - EPOCH).total_seconds() / 86400
    longitudes = {key: lon(body, jd) for key, body in BODIES.items()}
    longitudes['Ketu'] = (longitudes['Rahu'] + 180) % 360
    true_node = lon(swe.TRUE_NODE, jd)
    aya = swe.get_ayanamsa_ex_ut(jd, FLAGS)[1]
    # Equal houses avoids Placidus failure near the poles. Only the ascendant is used.
    asc = (swe.houses_ex(jd, x['lat'], x['lon'], b'E')[1][0] - aya) % 360
    moon = longitudes['Moon']
    nakf = moon / (360 / 27)
    nak = math.floor(nakf)
    first = nak % 9
    start = (utc - EPOCH).total_seconds() * 1000 - (nakf - nak) * YEARS[first] * YEAR
    periods = []
    for i in range(9):
        j = (first + i) % 9
        periods.append(dict(lord=ORDER[j], start=math.trunc(start)))
        start += YEARS[j] * YEAR
    e = elong(jd)
    tithi = math.floor(e / 12)
    midnight = {**x, 'hour': 0, 'minute': 0}
    mid, _ = utc_of(midnight)
    jd_mid = JD0 + (mid - EPOCH).total_seconds() / 86400
    def rise_set(j, event):
        result, values = swe.rise_trans(j, swe.SUN, event, (x['lon'], x['lat'], 0),
                                       1013.25, 15, FLAGS)
        return values[0] if result == 0 else None
    rise = rise_set(jd_mid, swe.CALC_RISE)
    setting = rise_set(rise, swe.CALC_SET) if rise is not None else None
    next_rise = rise_set(setting, swe.CALC_RISE) if setting is not None else None
    # Match the site's search windows. Missing polar events remain null.
    valid = (rise is not None and rise <= jd_mid + 1 and setting is not None
             and setting <= rise + 1 and next_rise is not None and next_rise <= setting + 1)
    return dict(id=index, input=x, utcMs=round((utc-EPOCH).total_seconds()*1000), offsetMinutes=offset,
                reference=dict(longitudes=longitudes, trueRahu=true_node, ascendant=asc,
                    ayanamsaTrue=aya, nakshatra=nak, pada=min(4, math.floor((moon-nak*(360/27))/(360/108))+1),
                    rashis={k:math.floor(v/30) for k,v in longitudes.items()},
                    tithi=tithi, karana=math.floor(e/6), yoga=math.floor(((moon+longitudes['Sun'])%360)/(360/27)),
                    tithiEndMs=ms(crossing(elong, ((tithi+1)*12)%360, jd)), dasha=periods,
                    sunriseMs=ms(rise) if valid else None, sunsetMs=ms(setting) if valid else None))

def ingress_references():
    start = swe.julday(1950, 1, 1, 0)
    end = swe.julday(2051, 1, 1, 0)
    out = []
    old = math.floor(lon(swe.SATURN, start)/30)
    while start < end:
        finish = min(start + 2, end)
        new = math.floor(lon(swe.SATURN, finish)/30)
        if new != old:
            lo, hi = start, finish
            for _ in range(35):
                mid = (lo+hi)/2
                if math.floor(lon(swe.SATURN, mid)/30) == old: lo = mid
                else: hi = mid
            out.append(dict(timeMs=ms((lo+hi)/2), fromSign=old, sign=new))
        old = new
        start = finish
    return out

def main():
    global FLAGS
    parser = argparse.ArgumentParser()
    parser.add_argument('--ephe', type=Path, help='Optional directory containing sepl_18.se1 and semo_18.se1')
    args = parser.parse_args()
    ephe = {}
    if args.ephe:
        for name in ['sepl_18.se1','semo_18.se1']:
            path = args.ephe / name
            ephe[name] = hashlib.sha256(path.read_bytes()).hexdigest()
        swe.set_ephe_path(str(args.ephe.resolve()))
        FLAGS = swe.FLG_SWIEPH
    cities = json.loads((ROOT/'cities.json').read_text())
    rng = random.Random(20261127)
    lo = dt.datetime(1900,1,1)
    span = (dt.datetime(2051,1,1)-lo).total_seconds()
    inputs = []
    # Stratified uniform coverage in time; all 70 places are covered repeatedly.
    for i in range(350):
        local = lo + dt.timedelta(seconds=span*(i+rng.random())/350)
        inputs.append(wall_input(local,cities[(i*31)%len(cities)]))
    # Explicit midnight, leap-day and historic India war-time cases.
    for local, city in [(dt.datetime(2000,2,29,0,0),cities[0]),
                        (dt.datetime(1944,8,1,6,0),cities[1]),
                        (dt.datetime(1900,1,1,0,0),cities[0]),
                        (dt.datetime(2050,12,31,23,59),cities[0])]:
        inputs.append(wall_input(local,city))
    # Moon sign / nakshatra boundary stress, rounded to the supported civil minute.
    for i in range(32):
        jd = swe.julday(1901+i*4, 2, 1, 0)
        width = 30 if i%2 == 0 else 360/27
        target = ((math.floor(lon(swe.MOON,jd)/width)+1)*width)%360
        event = crossing(lambda j:lon(swe.MOON,j),target,jd,limit=4)
        local = (EPOCH + dt.timedelta(milliseconds=ms(event))).astimezone(ZoneInfo('Asia/Kolkata'))
        for minute_delta in [0,1]:
            inputs.append(wall_input(local+dt.timedelta(minutes=minute_delta),cities[0]))
    charts = [reference(x,i) for i,x in enumerate(inputs)]
    result = dict(metadata=dict(seed=20261127, randomCharts=350, edgeCharts=len(charts)-350,
                  python=platform.python_version(), pyswissephDistribution='2.10.3.2',
                  pyswissephBuild=swe.__version__, swiss=swe.version,
                  ephemeris='Swiss files' if ephe else 'Moshier', ephemerisSha256=ephe,
                  flags=FLAGS, siderealMode=swe.SIDM_LAHIRI, cities=len(cities),
                  indiaCities=sum(c[3]=='Asia/Kolkata' for c in cities)),
                  charts=charts, saturnIngresses=ingress_references())
    target = ROOT/'reference/charts.json'
    target.parent.mkdir(exist_ok=True)
    target.write_text(json.dumps(result,indent=2,allow_nan=False)+'\n')
    print(f'Wrote {len(charts)} charts and {len(result["saturnIngresses"])} Saturn ingresses, {result["metadata"]["ephemeris"]}.')

if __name__ == '__main__': main()
