/** Internal calculation module. */
export default function install(PJ, Astronomy) {


  var BODIES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  function tropicalApparent(body, time) {
    var A = Astronomy;
    if (body === 'Sun') return A.SunPosition(time).elon;
    var vec = A.GeoVector(body, time, true);
    return A.Ecliptic(vec).elon;
  }
  function siderealAt(body, time) {
    var T = PJ.astro.centuriesTT(time);
    return PJ.astro.norm360(tropicalApparent(body, time) - PJ.astro.ayanamsaTrue(T));
  }
  function diff(a, b) { var d = a - b; if (d > 180) d -= 360; if (d < -180) d += 360; return d; }

  PJ.planets = function (time) {
    var A = Astronomy, out = {}, h = 0.25;
    var t1 = time.AddDays(-h), t2 = time.AddDays(h);
    BODIES.forEach(function (b) {
      var lon = siderealAt(b, time);
      var speed = diff(siderealAt(b, t2), siderealAt(b, t1)) / (2 * h);
      out[b] = { lon: lon, speed: speed, retro: (b !== 'Sun' && b !== 'Moon') && speed < 0 };
    });
    return out;
  };
  PJ.planets.siderealAt = siderealAt;
  PJ.planets.angleDiff = diff;

}
