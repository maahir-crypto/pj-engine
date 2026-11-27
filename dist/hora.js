/** Internal calculation module. */
export default function install(PJ, Astronomy) {


  var NAMES = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
  var HINDI = ['सूर्य', 'शुक्र', 'बुध', 'चंद्रमा', 'शनि', 'गुरु', 'मंगल'];
  var DAYSTART = [0, 3, 6, 2, 5, 1, 4];

  function calc(date, city) {
    var A = Astronomy, p = date.split('-').map(Number);
    var midnight = PJ.localToUtc(p[0], p[1], p[2], 0, 0, city.tz).utc;
    var civil = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    var wd = civil.getUTCDay(), obs = new A.Observer(city.lat, city.lon, 0);

    var rise = A.SearchRiseSet(A.Body.Sun, obs, 1, midnight, 1);
    if (!rise) return null;
    var set = A.SearchRiseSet(A.Body.Sun, obs, -1, rise.date, 1);
    if (!set) return null;
    var next = A.SearchRiseSet(A.Body.Sun, obs, 1, set.date, 1);
    if (!next) return null;
    var sunrise = rise.date.getTime(), sunset = set.date.getTime(), nextSunrise = next.date.getTime();
    var dd = (sunset - sunrise) / 12, nd = (nextSunrise - sunset) / 12;
    var day = [], night = [];
    function slot(n, start, end) {
      var index = (DAYSTART[wd] + n) % 7;
      return { number: n + 1, index: index, name: NAMES[index], start: new Date(start), end: new Date(end) };
    }
    for (var i = 0; i < 12; i++) {
      day.push(slot(i, sunrise + i * dd, sunrise + (i + 1) * dd));
      night.push(slot(i + 12, sunset + i * nd, sunset + (i + 1) * nd));
    }
    return { date: date, weekday: wd, sunrise: rise.date, sunset: set.date, nextSunrise: next.date, day: day, night: night };
  }
  function previousDate(date) {
    var p = date.split('-').map(Number);
    return new Date(Date.UTC(p[0], p[1] - 1, p[2] - 1)).toISOString().slice(0, 10);
  }

  function forInstant(date, city, instant) {
    var r = calc(date, city);
    return r && instant.getTime() < r.sunrise.getTime() ? calc(previousDate(date), city) : r;
  }
  PJ.hora = { calc: calc, forInstant: forInstant };

}
