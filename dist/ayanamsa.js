/** Internal calculation module. */
export default function install(PJ, Astronomy) {


  var D2R = Math.PI / 180;
  function norm360(x) { x %= 360; return x < 0 ? x + 360 : x; }

  function centuriesTT(time) { return time.tt / 36525; }

  function precessionArcsec(T) {
    return 5028.796195 * T + 1.1054348 * T * T + 0.00007964 * T * T * T;
  }
  var LAHIRI_T0 = (2435553.5 - 2451545.0) / 36525; // centuries from J2000
  var LAHIRI_AYAN_T0 = 23.250182778 - 0.004658035;  // degrees

  function lahiriMean(T) {
    return LAHIRI_AYAN_T0 + (precessionArcsec(T) - precessionArcsec(LAHIRI_T0)) / 3600;
  }

  var NUT = [

    [0, 0, 0, 0, 1, -171996, -174.2, 92025, 8.9],
    [-2, 0, 0, 2, 2, -13187, -1.6, 5736, -3.1],
    [0, 0, 0, 2, 2, -2274, -0.2, 977, -0.5],
    [0, 0, 0, 0, 2, 2062, 0.2, -895, 0.5],
    [0, 1, 0, 0, 0, 1426, -3.4, 54, -0.1],
    [0, 0, 1, 0, 0, 712, 0.1, -7, 0],
    [-2, 1, 0, 2, 2, -517, 1.2, 224, -0.6],
    [0, 0, 0, 2, 1, -386, -0.4, 200, 0],
    [0, 0, 1, 2, 2, -301, 0, 129, -0.1],
    [-2, -1, 0, 2, 2, 217, -0.5, -95, 0.3],
    [-2, 0, 1, 0, 0, -158, 0, 0, 0],
    [-2, 0, 0, 2, 1, 129, 0.1, -70, 0],
    [0, 0, -1, 2, 2, 123, 0, -53, 0],
    [2, 0, 0, 0, 0, 63, 0, 0, 0],
    [0, 0, 1, 0, 1, 63, 0.1, -33, 0],
    [2, 0, -1, 2, 2, -59, 0, 26, 0],
    [0, 0, -1, 0, 1, -58, -0.1, 32, 0],
    [0, 0, 1, 2, 1, -51, 0, 27, 0]
  ];
  function nutation(T) {
    var D = (297.85036 + 445267.111480 * T - 0.0019142 * T * T + T * T * T / 189474) * D2R;
    var M = (357.52772 + 35999.050340 * T - 0.0001603 * T * T - T * T * T / 300000) * D2R;
    var Mp = (134.96298 + 477198.867398 * T + 0.0086972 * T * T + T * T * T / 56250) * D2R;
    var F = (93.27191 + 483202.017538 * T - 0.0036825 * T * T + T * T * T / 327270) * D2R;
    var Om = (125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000) * D2R;
    var dpsi = 0, deps = 0;
    for (var i = 0; i < NUT.length; i++) {
      var r = NUT[i];
      var arg = r[0] * D + r[1] * M + r[2] * Mp + r[3] * F + r[4] * Om;
      dpsi += (r[5] + r[6] * T) * Math.sin(arg);
      deps += (r[7] + r[8] * T) * Math.cos(arg);
    }
    return { dpsi: dpsi / 36000000, deps: deps / 36000000 }; // degrees
  }
  function meanObliquity(T) {
    var U = T;
    return 23.43929111 - (46.8150 * U + 0.00059 * U * U - 0.001813 * U * U * U) / 3600;
  }

  PJ.astro = {
    D2R: D2R, norm360: norm360, centuriesTT: centuriesTT,
    lahiriMean: lahiriMean, nutation: nutation, meanObliquity: meanObliquity,

    ayanamsaTrue: function (T) { return lahiriMean(T) + nutation(T).dpsi; }
  };

}
