/** Internal calculation module. */
export default function install(PJ, Astronomy) {


  var YEAR = 365.25 * 86400000;
  var YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
  function contains(p, now) { return +now >= +p.start && +now < +p.end; }
  function pratyantars(parent) {
    var order = PJ.vimshottari.ORDER, first = order.indexOf(parent.lord), t = +parent.start;
    return order.map(function (_, i) {
      var lord = order[(first + i) % 9];
      var end = i === 8 ? +parent.end : t + (+parent.end - +parent.start) * YEARS[lord] / 120;
      var p = { lord: lord, start: new Date(t), end: new Date(end) }; t = +p.end; return p;
    });
  }
  function model(dasha, now) {


    var periods = dasha.periods.map(function (p) {
      var sub = p.sub.map(function (q, i) {
        return { lord: q.lord, start: new Date(i ? +p.sub[i - 1].end : +p.start),
          end: new Date(i === 8 ? +p.end : +q.end) };
      });
      return { lord: p.lord, start: new Date(+p.start), end: new Date(+p.end), sub: sub };
    });
    var currentPeriods = periods, cycle = 0;


    var span = +periods[8].end - +periods[0].start;
    if (+now >= +periods[8].end) {
      cycle = Math.floor((+now - +periods[0].start) / span);
      var shift = cycle * span;
      currentPeriods = periods.map(function (p) {
        return { lord: p.lord, start: new Date(+p.start + shift), end: new Date(+p.end + shift),
          sub: p.sub.map(function (q) { return { lord: q.lord, start: new Date(+q.start + shift), end: new Date(+q.end + shift) }; }) };
      });
    }
    var maha = currentPeriods.find(function (p) { return contains(p, now); });
    var antar = maha && maha.sub.find(function (p) { return contains(p, now); });
    var pratyantar = antar && pratyantars(antar).find(function (p) { return contains(p, now); });
    return { periods: periods, maha: maha, antar: antar, pratyantar: pratyantar, cycle: cycle };
  }
  function calculate(input, now) { return PJ.computeKundli(input, now); }
  PJ.mahadasha = { YEAR: YEAR, contains: contains, pratyantars: pratyantars, model: model, calculate: calculate };

}
