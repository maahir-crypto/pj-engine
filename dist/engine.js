/** Internal calculation module. */
export default function install(PJ, Astronomy) {


  var ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  PJ.computeKundli = function (input, now) {
    var conv = (input.tz && !isFinite(input.offsetMinutes))
      ? PJ.localToUtc(input.year, input.month, input.day, input.hour, input.minute, input.tz)
      : PJ.localToUtcFixed(input.year, input.month, input.day, input.hour, input.minute, input.offsetMinutes);
    var time = Astronomy.MakeTime(conv.utc);
    var T = PJ.astro.centuriesTT(time);
    var pl = PJ.planets(time);
    var nd = PJ.nodes(time, input.nodeMode === 'true' ? 'true' : 'mean');
    pl.Rahu = nd.Rahu; pl.Ketu = nd.Ketu;
    var lagnaLon = PJ.lagna(time, input.lat, input.lon);
    var lag = PJ.info(lagnaLon);
    var bodies = {};
    ORDER.forEach(function (b) {
      var i = PJ.info(pl[b].lon);
      i.retro = pl[b].retro; i.speed = pl[b].speed;
      i.house = PJ.houseOf(i.sign, lag.sign);
      i.d9 = PJ.navamsaSign(pl[b].lon);
      bodies[b] = i;
    });
    lag.d9 = PJ.navamsaSign(lagnaLon);
    var moon = bodies.Moon;
    var dasha = PJ.vimshottari(moon.lon, conv.utc, now);
    var mang = PJ.manglik(bodies.Mars.sign, lag.sign, moon.sign);
    return {
      utc: conv.utc, offsetMinutes: conv.offsetMinutes, tzNote: conv.note,
      ayanamsa: PJ.astro.ayanamsaTrue(T), nodeMode: nd.mode,
      lagna: lag, bodies: bodies, order: ORDER,
      rashi: moon.sign, nakshatra: moon.nak, pada: moon.pada,
      dasha: dasha, manglik: mang
    };
  };

}
