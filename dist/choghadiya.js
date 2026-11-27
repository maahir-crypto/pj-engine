/** Internal calculation module. */
export default function install(PJ, Astronomy) {


  var NAMES = ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'];
  var HINDI = ['उद्वेग', 'चर', 'लाभ', 'अमृत', 'काल', 'शुभ', 'रोग'];
  var DAYSTART = [0, 3, 6, 2, 5, 1, 4];
  var RK = [8, 2, 7, 5, 6, 4, 3], YG = [5, 4, 3, 2, 1, 7, 6], GK = [7, 6, 5, 4, 3, 2, 1];


  function calc(date, city) {
    var A = Astronomy, p = date.split('-').map(Number);
    var midnight = PJ.localToUtc(p[0], p[1], p[2], 0, 0, city.tz).utc;
    var civil = new Date(0);
    civil.setUTCFullYear(p[0], p[1] - 1, p[2]); civil.setUTCHours(0, 0, 0, 0);
    var wd = civil.getUTCDay(), obs = new A.Observer(city.lat, city.lon, 0);
    var rise = A.SearchRiseSet(A.Body.Sun, obs, 1, midnight, 1);
    if (!rise) return null;
    var set = A.SearchRiseSet(A.Body.Sun, obs, -1, rise.date, 1);
    if (!set) return null;
    var next = A.SearchRiseSet(A.Body.Sun, obs, 1, set.date, 1);
    if (!next) return null;
    var sunrise = rise.date.getTime(), sunset = set.date.getTime(), nextSunrise = next.date.getTime();
    var dd = (sunset - sunrise) / 8, nd = (nextSunrise - sunset) / 8;
    function slot(index, start, end) {
      return { index: index, name: NAMES[index], start: new Date(start), end: new Date(end) };
    }
    function segment(k) { return { start: new Date(sunrise + (k - 1) * dd), end: new Date(sunrise + k * dd) }; }
    var day = [], night = [], i, nightStart = (DAYSTART[wd] + 5) % 7;
    for (i = 0; i < 8; i++) {
      day.push(slot((DAYSTART[wd] + i) % 7, sunrise + i * dd, sunrise + (i + 1) * dd));
      night.push(slot(((nightStart - 2 * i) % 7 + 7) % 7, sunset + i * nd, sunset + (i + 1) * nd));
    }
    var mid = (sunrise + sunset) / 2, m = (sunset - sunrise) / 15;
    return { weekday: wd, sunrise: rise.date, sunset: set.date, nextSunrise: next.date,
      day: day, night: night, rahu: segment(RK[wd]), yamaganda: segment(YG[wd]), gulika: segment(GK[wd]),
      abhijit: { start: new Date(mid - m / 2), end: new Date(mid + m / 2), traditionallyUsed: wd !== 3 } };
  }
  PJ.choghadiya = { calc: calc };

}
