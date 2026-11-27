/** Internal calculation module. */
export default function install(PJ, Astronomy) {

  var DAY = 86400000;
  var START = Date.parse('1950-01-01T00:00:00+05:30');
  var END = Date.parse('2101-01-01T00:00:00+05:30');
  function signAt(ms) {
    return Math.floor(PJ.planets.siderealAt('Saturn', new Astronomy.AstroTime(new Date(ms))) / 30);
  }
  function status(moon, saturn) {
    var house = (saturn - moon + 12) % 12 + 1;
    return { house: house, phase: house === 12 ? 1 : house === 1 ? 2 : house === 2 ? 3 : 0,
      dhaiya: house === 4 || house === 8 };
  }

  function scanner() {
    var cursor = START, start = START, sign = signAt(START), spans = [], done = false;
    return { step: function (samples) {
      while (samples-- > 0 && !done) {
        var next = Math.min(cursor + 2 * DAY, END), nextSign = signAt(next);
        if (nextSign !== sign) {
          var lo = cursor, hi = next;
          while (hi - lo > 1000) {
            var mid = (lo + hi) / 2;
            if (signAt(mid) === sign) lo = mid; else hi = mid;
          }
          spans.push({ start: start, end: hi, sign: sign }); start = hi; sign = nextSign;
        }
        cursor = next;
        if (cursor === END) { spans.push({ start: start, end: END, sign: sign }); done = true; }
      }
      return done ? spans : null;
    } };
  }
  function scan() { return scanner().step(Infinity); }
  function cycles(moon, spans) {
    var out = [], current;
    spans.forEach(function (s) {
      var phase = status(moon, s.sign).phase;
      if (!phase) return;

      if (!current || s.start - current.end > 730 * DAY) {
        current = { start: s.start, end: s.end, spans: [], gaps: [] }; out.push(current);
      } else if (s.start > current.end) current.gaps.push({ start: current.end, end: s.start });
      current.spans.push({ start: s.start, end: s.end, sign: s.sign, phase: phase }); current.end = s.end;
    });
    return out;
  }
  function report(moon, now, spans) {
    if (!Number.isInteger(moon) || moon < 0 || moon > 11 || !isFinite(now) || now < START || now >= END) throw new Error('range');
    var all = cycles(moon, spans), index = all.findIndex(function (c) { return c.end > now; });
    var current = status(moon, signAt(now));
    return { status: current, cycle: index < 0 ? null : all[index], previous: index < 0 ? all[all.length - 1] : all[index - 1],
      dhaiya: spans.filter(function (s) { return s.end > now && status(moon, s.sign).dhaiya; }).slice(0, 6) };
  }
  PJ.sadeSati = { signAt: signAt, status: status, scan: scan, scanner: scanner, cycles: cycles, report: report, start: START, end: END };

}
