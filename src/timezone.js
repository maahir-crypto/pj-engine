/** Internal calculation module. */
export default function install(PJ, Astronomy) {


  var fmtCache = {};
  function fmt(tz) {
    if (!fmtCache[tz]) {
      fmtCache[tz] = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric', era: 'short'
      });
    }
    return fmtCache[tz];
  }

  function offsetAt(tz, ms) {
    var p = {}, parts = fmt(tz).formatToParts(new Date(ms));
    for (var i = 0; i < parts.length; i++) p[parts[i].type] = parts[i].value;
    var y = +p.year; if (p.era === 'BC' || p.era === 'B') y = 1 - y;
    var h = +p.hour % 24;
    var asUtc = Date.UTC(y, +p.month - 1, +p.day, h, +p.minute, +p.second);
    var d = new Date(0); d.setUTCFullYear(y, +p.month - 1, +p.day); d.setUTCHours(h, +p.minute, +p.second, 0);
    asUtc = d.getTime();
    return Math.round((asUtc - Math.floor(ms / 1000) * 1000) / 60000);
  }
  function wallUtcMs(y, mo, d, h, mi) {
    var t = new Date(0); t.setUTCFullYear(y, mo - 1, d); t.setUTCHours(h, mi, 0, 0); return t.getTime();
  }
  PJ.isValidZone = function (tz) { try { fmt(tz); return true; } catch (e) { return false; } };

  
  PJ.localToUtc = function (y, mo, d, h, mi, tz) {
    var wall = wallUtcMs(y, mo, d, h, mi);
    var o1 = offsetAt(tz, wall);
    var guess = wall - o1 * 60000;
    var o2 = offsetAt(tz, guess);
    var note = null, utc = guess;
    if (o2 !== o1) {
      var g2 = wall - o2 * 60000;
      var o3 = offsetAt(tz, g2);
      if (o3 === o2) { utc = g2; } else { note = 'gap'; utc = wall - Math.max(o1, o2) * 60000; }
    }
    var off = offsetAt(tz, utc);

    [-120, -60, 60, 120].forEach(function (dm) {
      var alt = wall - (off + dm) * 60000;
      if (!note && offsetAt(tz, alt) === off + dm) note = 'ambiguous';
    });
    if (note !== 'gap' && wall - off * 60000 !== utc) note = 'gap';
    return { utc: new Date(utc), offsetMinutes: off, note: note };
  };
  PJ.localToUtcFixed = function (y, mo, d, h, mi, offsetMinutes) {
    return { utc: new Date(wallUtcMs(y, mo, d, h, mi) - offsetMinutes * 60000), offsetMinutes: offsetMinutes, note: null };
  };
  PJ.formatOffset = function (m) {
    var s = m < 0 ? '-' : '+'; m = Math.abs(m);
    return 'UTC' + s + Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2);
  };
  PJ.offsetAt = offsetAt;

}
