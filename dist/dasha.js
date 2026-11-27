/** Internal calculation module. */
export default function install(PJ, Astronomy) {


  var ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  var YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
  var DAY = 86400000, YEAR = 365.25 * DAY;

  PJ.vimshottari = function (moonLon, birth, now) {
    now = now || birth;
    var nakF = moonLon / PJ.NAK_SPAN;
    var nak = Math.floor(nakF) % 27;
    var elapsedFrac = nakF - Math.floor(nakF);
    var first = nak % 9;
    var startMs = birth.getTime() - elapsedFrac * YEARS[ORDER[first]] * YEAR;
    var periods = [], t = startMs;
    for (var i = 0; i < 9; i++) {
      var lord = ORDER[(first + i) % 9], len = YEARS[lord] * YEAR;
      var md = { lord: lord, start: new Date(t), end: new Date(t + len), sub: [] };
      var st = t;
      for (var j = 0; j < 9; j++) {
        var sl = ORDER[(first + i + j) % 9];
        var sLen = len * YEARS[sl] / 120;
        md.sub.push({ lord: sl, start: new Date(st), end: new Date(st + sLen), current: now >= st && now < st + sLen });
        st += sLen;
      }
      md.current = now >= t && now < t + len;
      periods.push(md);
      t += len;
    }
    var balYears = (1 - elapsedFrac) * YEARS[ORDER[first]];
    return { startLord: ORDER[first], balanceYears: balYears, periods: periods, YEARS: YEARS };
  };
  PJ.vimshottari.ORDER = ORDER;

}
