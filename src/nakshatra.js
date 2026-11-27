/** Internal calculation module. */
export default function install(PJ, Astronomy) {


  var SIGNS = {
    en: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
    hi: ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'],
    rashi: ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena']
  };
  var SIGN_LORD = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
  var NAK = {
    en: ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'],
    hi: ['अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु', 'पुष्य', 'आश्लेषा', 'मघा', 'पूर्व फाल्गुनी', 'उत्तर फाल्गुनी', 'हस्त', 'चित्रा', 'स्वाति', 'विशाखा', 'अनुराधा', 'ज्येष्ठा', 'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्व भाद्रपद', 'उत्तर भाद्रपद', 'रेवती']
  };
  var PLANET = {
    en: { Lagna: 'Lagna', Sun: 'Sun', Moon: 'Moon', Mars: 'Mars', Mercury: 'Mercury', Jupiter: 'Jupiter', Venus: 'Venus', Saturn: 'Saturn', Rahu: 'Rahu', Ketu: 'Ketu' },
    hi: { Lagna: 'लग्न', Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु' }
  };
  var ABBR = {
    en: { Lagna: 'As', Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke' },
    hi: { Lagna: 'ल', Sun: 'सू', Moon: 'चं', Mars: 'मं', Mercury: 'बु', Jupiter: 'गु', Venus: 'शु', Saturn: 'श', Rahu: 'रा', Ketu: 'के' }
  };
  var NAK_SPAN = 360 / 27, PADA_SPAN = NAK_SPAN / 4;

  function info(lon) {
    var sign = Math.floor(lon / 30) % 12;
    var nak = Math.floor(lon / NAK_SPAN) % 27;
    var pada = Math.floor((lon - nak * NAK_SPAN) / PADA_SPAN) + 1;
    if (pada > 4) pada = 4;
    return { lon: lon, sign: sign, degInSign: lon - sign * 30, nak: nak, pada: pada };
  }
  function dms(deg) {
    var s = Math.round(deg * 3600);
    var d = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return d + '°' + (m < 10 ? '0' : '') + m + '′' + (sec < 10 ? '0' : '') + sec + '″';
  }
  PJ.names = { SIGNS: SIGNS, SIGN_LORD: SIGN_LORD, NAK: NAK, PLANET: PLANET, ABBR: ABBR };
  PJ.info = info;
  PJ.dms = dms;
  PJ.NAK_SPAN = NAK_SPAN;

}
