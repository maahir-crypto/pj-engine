/** Internal calculation module. */
export default function install(PJ, Astronomy) {


  var a = function () { return PJ.astro; };

  function meanNodeTropical(T) {
    return a().norm360(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T +
      T * T * T / 467441 - T * T * T * T / 60616000);
  }

  function trueNodeTropical(time) {
    var A = Astronomy;
    var s = A.GeoMoonState(time);
    var rot = A.Rotation_EQJ_ECT(time);
    var r = A.RotateVector(rot, new A.Vector(s.x, s.y, s.z, time));
    var v = A.RotateVector(rot, new A.Vector(s.vx, s.vy, s.vz, time));
    var hx = r.y * v.z - r.z * v.y, hy = r.z * v.x - r.x * v.z;
    var lonTrueEq = Math.atan2(hx, -hy) / a().D2R;

    return a().norm360(lonTrueEq - a().nutation(a().centuriesTT(time)).dpsi);
  }

  PJ.nodes = function (time, mode) {
    var T = a().centuriesTT(time);
    var ayanMean = a().lahiriMean(T);
    function lonAt(t) {
      var trop = mode === 'true' ? trueNodeTropical(t) : meanNodeTropical(a().centuriesTT(t));
      return a().norm360(trop - a().lahiriMean(a().centuriesTT(t)));
    }
    var lon = lonAt(time);
    var speed = PJ.planets.angleDiff(lonAt(time.AddDays(0.25)), lonAt(time.AddDays(-0.25))) / 0.5;
    var ketu = a().norm360(lon + 180);
    return {
      Rahu: { lon: lon, speed: speed, retro: true, trueMotionRetro: speed < 0 },
      Ketu: { lon: ketu, speed: speed, retro: true, trueMotionRetro: speed < 0 },
      mode: mode === 'true' ? 'true' : 'mean', ayanamsaMean: ayanMean
    };
  };

}
