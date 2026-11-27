import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kundli } from '../dist/index.js';
import { createCalculations, Astronomy as A } from '../dist/internal.js';
const calc = createCalculations();
test('Polar ascendant is the rising intersection in both hemispheres', () => {
  for(const lat of [69.65,-69.65]) for(let hour=0;hour<24;hour++) {
    const input = {year:1943,month:10,day:7,hour,minute:45,lat,lon:18.96,offsetMinutes:120};
    const k=kundli(input), time=A.MakeTime(new Date(k.utc));
    const T=calc.astro.centuriesTT(time), eps=(calc.astro.meanObliquity(T)+calc.astro.nutation(T).deps)*Math.PI/180;
    const lambda=(k.lagna.lon+k.ayanamsa)*Math.PI/180;
    const ra=(Math.atan2(Math.sin(lambda)*Math.cos(eps),Math.cos(lambda))*180/Math.PI+360)%360/15;
    const dec=Math.asin(Math.sin(lambda)*Math.sin(eps))*180/Math.PI;
    const observer = new A.Observer(lat,18.96,0);
    const horizon=A.Horizon(time,observer,ra,dec);
    assert.ok(horizon.azimuth>=0 && horizon.azimuth<=180,'Ascendant must be east');
    assert.ok(Math.abs(horizon.altitude)<1e-9,'Ascendant must be on the horizon');
    const before=A.Horizon(time.AddDays(-1/86400),observer,ra,dec).altitude;
    const after=A.Horizon(time.AddDays(1/86400),observer,ra,dec).altitude;
    assert.ok(after>before,'Altitude must increase through the horizon');
  }
});
