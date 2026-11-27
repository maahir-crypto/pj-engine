/** Internal calculation module. */
export default function install(PJ, Astronomy) {


  var A = function () { return Astronomy; };
  var SPAN = 360 / 27;

  var TITHI = {
    en: ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima', 'Amavasya'],
    hi: ['प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा', 'अमावस्या']
  };
  var YOGA = {
    en: ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shoola', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'],
    hi: ['विष्कम्भ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगण्ड', 'सुकर्मा', 'धृति', 'शूल', 'गण्ड', 'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र', 'सिद्धि', 'व्यतीपात', 'वरीयान', 'परिघ', 'शिव', 'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'इन्द्र', 'वैधृति']
  };
  var KARANA = {
    en: ['Kimstughna', 'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga'],
    hi: ['किंस्तुघ्न', 'बव', 'बालव', 'कौलव', 'तैतिल', 'गर', 'वणिज', 'विष्टि', 'शकुनि', 'चतुष्पाद', 'नाग']
  };
  var VAAR = {
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    hi: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार']
  };
  var MASA = {
    en: ['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwina', 'Kartika', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna'],
    hi: ['चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ़', 'श्रावण', 'भाद्रपद', 'आश्विन', 'कार्तिक', 'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन']
  };
  
  var NAK_TO_MASA = [6, 6, 7, 7, 8, 8, 9, 9, 9, 10, 11, 11, 11, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 6];

  function norm360(x) { x %= 360; if (x < 0) x += 360; return x; }
  function makeTime(d) { return A().MakeTime(d instanceof Date ? d : new Date(d)); }
  function sidereal(body, date) { return PJ.planets.siderealAt(body, makeTime(date)); }
  function elongAt(date) { return norm360(sidereal('Moon', date) - sidereal('Sun', date)); }
  function sumLonAt(date) { return norm360(sidereal('Sun', date) + sidereal('Moon', date)); }

  
  function searchAngle(fn, target, start, maxHours) {
    var t1 = start.getTime(), e1 = fn(new Date(t1));
    var step = 2 * 3600000, limit = t1 + (maxHours || 48) * 3600000;
    var t2, e2, i;
    for (t2 = t1 + step; t2 <= limit + step; t2 += step) {
      e2 = fn(new Date(Math.min(t2, limit + step)));
      var passed = norm360(e2 - e1);
      var need = norm360(target - e1);
      if (need <= passed && passed < 180) break;
      t1 = t2; e1 = e2;
      if (t2 > limit) return null;
    }
    for (i = 0; i < 32; i++) {
      var mid = (t1 + t2) / 2, em = fn(new Date(mid));
      var passed1 = norm360(em - e1);
      var need1 = norm360(target - e1);
      if (need1 <= passed1 && passed1 < 180) { t2 = mid; e2 = em; }
      else { t1 = mid; e1 = em; }
    }
    return new Date((t1 + t2) / 2);
  }

  function tithiIndex(elong) { return Math.floor(elong / 12) % 30; }
  function tithiName(idx, lang) {
    var i = idx % 30;
    if (i === 14) return TITHI[lang][14];
    if (i === 29) return TITHI[lang][15];
    return TITHI[lang][i % 15];
  }
  function karanaIndex(elong) { return Math.floor(elong / 6) % 60; }
  function karanaKind(idx) {
    if (idx === 0) return 0;
    if (idx >= 57) return 8 + (idx - 57);
    return 1 + ((idx - 1) % 7);
  }

  function packTithi(elong, start) {
    var idx = tithiIndex(elong);
    var end = searchAngle(elongAt, ((idx + 1) * 12) % 360, start, 36);
    return {
      index: idx,
      number: (idx % 15) + 1,
      paksha: idx < 15 ? 'shukla' : 'krishna',
      name: { hi: tithiName(idx, 'hi'), en: tithiName(idx, 'en') },
      end: end
    };
  }
  function packNak(moonLon, start) {
    var idx = Math.floor(moonLon / SPAN) % 27;
    var end = searchAngle(function (d) { return sidereal('Moon', d); }, ((idx + 1) * SPAN) % 360, start, 36);
    var N = (PJ.names && PJ.names.NAK) ? PJ.names.NAK : { hi: [], en: [] };
    return { index: idx, name: { hi: N.hi[idx] || '', en: N.en[idx] || '' }, end: end };
  }
  function packYoga(sum, start) {
    var idx = Math.floor(sum / SPAN) % 27;
    var end = searchAngle(sumLonAt, ((idx + 1) * SPAN) % 360, start, 36);
    return { index: idx, name: { hi: YOGA.hi[idx], en: YOGA.en[idx] }, end: end };
  }
  function packKarana(elong, start) {
    var idx = karanaIndex(elong);
    var kind = karanaKind(idx);
    var end = searchAngle(elongAt, ((idx + 1) * 6) % 360, start, 24);
    return { index: idx, name: { hi: KARANA.hi[kind], en: KARANA.en[kind] }, end: end };
  }

  function masaFromNak(nak) { return NAK_TO_MASA[nak % 27]; }
  function masaName(i) { return { hi: MASA.hi[i], en: MASA.en[i] }; }

  function nextPurnima(from) {
    var e = elongAt(from), start = from;
    if (norm360(e - 180) < 0.02) start = new Date(from.getTime() + 120000);
    return searchAngle(elongAt, 180, start, 36 * 24);
  }
  function nextAmavasya(from) {
    var e = elongAt(from), start = from;
    if (e < 0.02 || e > 359.98) start = new Date(from.getTime() + 120000);
    return searchAngle(elongAt, 0, start, 36 * 24);
  }
  function prevCrossing(target, at) {
    return searchAngle(elongAt, target, new Date(at.getTime() - 32 * 86400000), 33 * 24);
  }

  function lunarMonths(at) {
    var elong = elongAt(at);
    
    var purnima = nextPurnima(at);
    
    var amantaSource = (elong >= 180) ? prevCrossing(180, at) : nextPurnima(at);
    var pMasa = purnima ? masaFromNak(Math.floor(sidereal('Moon', purnima) / SPAN) % 27) : null;
    var amanta = amantaSource ? masaFromNak(Math.floor(sidereal('Moon', amantaSource) / SPAN) % 27) : null;
    return {
      purnimanta: pMasa != null ? masaName(pMasa) : { hi: '-', en: '-' },
      amanta: amanta != null ? masaName(amanta) : { hi: '-', en: '-' },
      purnimantaIndex: pMasa,
      amantaIndex: amanta,
      nextPurnima: purnima,
      nextAmavasya: nextAmavasya(at)
    };
  }

  function solarMonth(date) {
    var lon = sidereal('Sun', date);
    var i = Math.floor(lon / 30) % 12;
    return { index: i, name: { hi: PJ.names.SIGNS.hi[i], en: PJ.names.SIGNS.rashi[i] }, lon: lon };
  }

  
  function searchSunLon(target, start, maxDays) {
    return searchAngle(function (d) { return sidereal('Sun', d); }, target, start, (maxDays || 40) * 24);
  }

  function sankrantiInYear(year) {
    var names = {
      hi: ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'],
      en: ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena']
    };
    var out = [], i, t;
    
    t = new Date(Date.UTC(year - 1, 11, 15));
    for (i = 0; i < 13; i++) {
      var lon = sidereal('Sun', t);
      var nextBoundary = ((Math.floor(lon / 30) + 1) * 30) % 360;
      var ev = searchSunLon(nextBoundary, t, 40);
      if (!ev) break;
      var idx = Math.floor(nextBoundary / 30) % 12;
      if (ev.getUTCFullYear() === year || civilYear(ev, 'Asia/Kolkata') === year) {
        if (civilYear(ev, 'Asia/Kolkata') === year) {
          out.push({ index: idx, longitude: nextBoundary, time: ev, name: { hi: names.hi[idx], en: names.en[idx] } });
        }
      }
      t = new Date(ev.getTime() + 3600000);
      if (out.length >= 12 && civilYear(t, 'Asia/Kolkata') > year) break;
    }
    return out;
  }

  function civilParts(instant, tz) {
    var p = {}, parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', weekday: 'short'
    }).formatToParts(instant);
    parts.forEach(function (v) { p[v.type] = v.value; });
    return p;
  }
  function civilDate(instant, tz) {
    var p = civilParts(instant, tz);
    return p.year + '-' + p.month + '-' + p.day;
  }
  function civilYear(instant, tz) { return +civilParts(instant, tz).year; }

  function calc(date, city) {
    var p = date.split('-').map(Number);
    var tz = city.tz || 'Asia/Kolkata';
    var midnight = PJ.localToUtc(p[0], p[1], p[2], 0, 0, tz).utc;
    var solar = PJ.choghadiya && PJ.choghadiya.calc(date, city);
    if (!solar) return null;
    var sunrise = solar.sunrise;
    var elong = elongAt(sunrise);
    var moonLon = sidereal('Moon', sunrise);
    var sumLon = sumLonAt(sunrise);
    var tithi = packTithi(elong, sunrise);
    var nak = packNak(moonLon, sunrise);
    var yoga = packYoga(sumLon, sunrise);
    var karana = packKarana(elong, sunrise);
    var months = lunarMonths(sunrise);
    var saur = solarMonth(sunrise);
    var wd = solar.weekday; 
    var Astro = A();
    var obs = new Astro.Observer(city.lat, city.lon, 0);
    var moonrise = Astro.SearchRiseSet(Astro.Body.Moon, obs, 1, midnight, 1.6);
    var moonset = Astro.SearchRiseSet(Astro.Body.Moon, obs, -1, midnight, 1.6);
    var nextTithi = null;
    if (tithi.end && civilDate(tithi.end, tz) === date) {
      nextTithi = packTithi(elongAt(new Date(tithi.end.getTime() + 2000)), new Date(tithi.end.getTime() + 2000));
    }
    return {
      date: date,
      city: city,
      weekday: wd,
      weekdayName: { hi: VAAR.hi[wd], en: VAAR.en[wd] },
      sunrise: solar.sunrise,
      sunset: solar.sunset,
      nextSunrise: solar.nextSunrise,
      moonrise: moonrise ? moonrise.date : null,
      moonset: moonset ? moonset.date : null,
      tithi: tithi,
      nextTithi: nextTithi,
      nakshatra: nak,
      yoga: yoga,
      karana: karana,
      paksha: tithi.paksha,
      pakshaName: tithi.paksha === 'shukla'
        ? { hi: 'शुक्ल पक्ष', en: 'Shukla paksha' }
        : { hi: 'कृष्ण पक्ष', en: 'Krishna paksha' },
      month: months,
      solarMonth: saur,
      rahu: solar.rahu,
      yamaganda: solar.yamaganda,
      gulika: solar.gulika,
      abhijit: solar.abhijit
    };
  }

  PJ.panchang = {
    calc: calc,
    elongAt: elongAt,
    sidereal: sidereal,
    searchAngle: searchAngle,
    sankrantiInYear: sankrantiInYear,
    lunarMonths: lunarMonths,
    nextPurnima: nextPurnima,
    nextAmavasya: nextAmavasya,
    civilDate: civilDate,
    civilParts: civilParts,
    names: { TITHI: TITHI, YOGA: YOGA, KARANA: KARANA, VAAR: VAAR, MASA: MASA }
  };

}
