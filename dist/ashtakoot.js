/** Internal calculation module. */
export default function install(PJ, Astronomy) {


  function L(en, hi) { return { en: en, hi: hi }; }

  var VARNA_NAMES = [null, L('Shudra', 'शूद्र'), L('Vaishya', 'वैश्य'), L('Kshatriya', 'क्षत्रिय'), L('Brahmin', 'ब्राह्मण')];
  var VARNA = [3, 2, 1, 4, 3, 2, 1, 4, 3, 2, 1, 4];

  var VASHYA_NAMES = [L('Chatushpada (quadruped)', 'चतुष्पद'), L('Manava (human)', 'मानव (द्विपद)'), L('Jalachara (water)', 'जलचर'), L('Vanachara (wild)', 'वनचर'), L('Keeta (insect)', 'कीट')];
  function vashyaGroup(lon) {
    var s = Math.floor(lon / 30) % 12, d = lon - s * 30;
    if (s === 0 || s === 1) return 0;
    if (s === 2 || s === 5 || s === 6 || s === 10) return 1;
    if (s === 3 || s === 11) return 2;
    if (s === 4) return 3;
    if (s === 7) return 4;
    if (s === 8) return d < 15 ? 1 : 0;   // Dhanu: first half human, second half quadruped
    return d < 15 ? 0 : 2;                // Makara: first half quadruped, second half water
  }

  var VASHYA = [
    [2, 1, 1, 0, 1],
    [1, 2, 0.5, 0, 1],
    [1, 0.5, 2, 1, 1],
    [0, 0, 1, 2, 0],
    [1, 1, 1, 0, 2]
  ];

  var TARA_NAMES = ['', 'Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyari', 'Sadhaka', 'Vadha', 'Mitra', 'Ati-Mitra'];
  var TARA_HI = ['', 'जन्म', 'संपत', 'विपत', 'क्षेम', 'प्रत्यरि', 'साधक', 'वध', 'मित्र', 'अति-मित्र'];
  function tara(from, to) { var n = ((to - from + 27) % 27) + 1, r = n % 9; return r === 0 ? 9 : r; }
  function taraGood(t) { return t !== 3 && t !== 5 && t !== 7; }


  var YONI_NAMES = [L('Horse', 'अश्व'), L('Elephant', 'गज'), L('Sheep', 'मेष (भेड़)'), L('Serpent', 'सर्प'), L('Dog', 'श्वान'), L('Cat', 'मार्जार'), L('Rat', 'मूषक'), L('Cow', 'गौ'), L('Buffalo', 'महिष'), L('Tiger', 'व्याघ्र'), L('Deer', 'मृग'), L('Monkey', 'वानर'), L('Mongoose', 'नकुल'), L('Lion', 'सिंह')];
  var YONI_OF = [0, 1, 2, 3, 3, 4, 5, 2, 5, 6, 6, 7, 8, 9, 8, 9, 10, 10, 4, 11, 12, 11, 13, 0, 13, 7, 1];

  var YONI = [
    [4,  2,  3,  1,  2,  3,  3,  3,  0,  1,  3,  2,  2,  1],
    [2,  4,  2,  2,  2,  3,  2,  2,  3,  1,  2,  2,  2,  0],
    [3,  2,  4,  1,  2,  3,  2,  3,  3,  1,  3,  0,  3,  1],
    [1,  2,  1,  4,  1,  1,  1,  1,  2,  2,  1,  1,  0,  2],
    [2,  2,  2,  1,  4,  1,  1,  1,  2,  1,  0,  2,  1,  1],
    [3,  3,  3,  1,  1,  4,  0,  2,  2,  2,  2,  2,  2,  2],
    [3,  2,  2,  1,  1,  0,  4,  2,  2,  2,  2,  2,  2,  1],
    [3,  2,  3,  1,  1,  2,  2,  4,  3,  0,  2,  2,  2,  1],
    [0,  2,  3,  2,  2,  2,  2,  3,  4,  1,  3,  2,  2,  1],
    [1,  1,  1,  2,  1,  2,  2,  0,  1,  4,  1,  1,  2,  2],
    [3,  2,  3,  1,  0,  2,  2,  2,  2,  1,  4,  2,  2,  1],
    [2,  2,  0,  1,  2,  2,  2,  2,  2,  1,  2,  4,  2,  2],
    [2,  2,  3,  0,  1,  2,  2,  2,  2,  2,  2,  2,  4,  2],
    [1,  0,  1,  2,  1,  2,  1,  1,  1,  2,  1,  2,  2,  4]
  ];

  var LORD = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
  var REL = { // F friend, N neutral, E enemy (Brihat Parashara Hora Shastra natural relations)
    Sun: { Moon: 'F', Mars: 'F', Jupiter: 'F', Mercury: 'N', Venus: 'E', Saturn: 'E' },
    Moon: { Sun: 'F', Mercury: 'F', Mars: 'N', Jupiter: 'N', Venus: 'N', Saturn: 'N' },
    Mars: { Sun: 'F', Moon: 'F', Jupiter: 'F', Venus: 'N', Saturn: 'N', Mercury: 'E' },
    Mercury: { Sun: 'F', Venus: 'F', Mars: 'N', Jupiter: 'N', Saturn: 'N', Moon: 'E' },
    Jupiter: { Sun: 'F', Moon: 'F', Mars: 'F', Saturn: 'N', Mercury: 'E', Venus: 'E' },
    Venus: { Mercury: 'F', Saturn: 'F', Mars: 'N', Jupiter: 'N', Sun: 'E', Moon: 'E' },
    Saturn: { Mercury: 'F', Venus: 'F', Jupiter: 'N', Sun: 'E', Moon: 'E', Mars: 'E' }
  };
  var MAITRI = { FF: 5, FN: 4, NF: 4, NN: 3, FE: 1, EF: 1, NE: 0.5, EN: 0.5, EE: 0 };
  var PL_HI = { Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि' };

  var GANA_NAMES = [L('Deva', 'देव'), L('Manushya', 'मनुष्य'), L('Rakshasa', 'राक्षस')];
  var GANA_OF = [0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1, 0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1, 1, 0];
  var GANA = [[6, 6, 0], [5, 6, 0], [1, 0, 6]]; // rows var, cols vadhu

  var NADI_NAMES = [L('Adi (Aadi)', 'आदि'), L('Madhya', 'मध्य'), L('Antya', 'अंत्य')];
  var NADI_OF = [0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2];

  var SIGN_EN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  var SIGN_HI = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];

  PJ.ashtakoot = function (m1, m2) {
    var s1 = Math.floor(m1 / 30) % 12, s2 = Math.floor(m2 / 30) % 12;
    var n1 = Math.floor(m1 / (360 / 27)) % 27, n2 = Math.floor(m2 / (360 / 27)) % 27;
    var k = [], notes = [];

    k.push({ key: 'varna', max: 1, score: VARNA[s1] >= VARNA[s2] ? 1 : 0, p1: VARNA_NAMES[VARNA[s1]], p2: VARNA_NAMES[VARNA[s2]] });

    var v1 = vashyaGroup(m1), v2 = vashyaGroup(m2);
    k.push({ key: 'vashya', max: 2, score: VASHYA[v1][v2], p1: VASHYA_NAMES[v1], p2: VASHYA_NAMES[v2] });

    var t1 = tara(n2, n1), t2 = tara(n1, n2); // t1: counted from vadhu to var; t2: var to vadhu
    k.push({ key: 'tara', max: 3, score: (taraGood(t1) ? 1.5 : 0) + (taraGood(t2) ? 1.5 : 0),
      p1: L(TARA_NAMES[t1], TARA_HI[t1]), p2: L(TARA_NAMES[t2], TARA_HI[t2]) });

    var y1 = YONI_OF[n1], y2 = YONI_OF[n2];
    k.push({ key: 'yoni', max: 4, score: YONI[y1][y2], p1: YONI_NAMES[y1], p2: YONI_NAMES[y2] });

    var l1 = LORD[s1], l2 = LORD[s2];
    var gm = l1 === l2 ? 5 : MAITRI[REL[l1][l2] + REL[l2][l1]];
    k.push({ key: 'maitri', max: 5, score: gm, p1: L(l1, PL_HI[l1]), p2: L(l2, PL_HI[l2]) });

    var g1 = GANA_OF[n1], g2 = GANA_OF[n2];
    k.push({ key: 'gana', max: 6, score: GANA[g1][g2], p1: GANA_NAMES[g1], p2: GANA_NAMES[g2] });

    var d = ((s1 - s2 + 12) % 12) + 1, bad = [2, 12, 5, 9, 6, 8].indexOf(d) >= 0;
    var sameStar = s1 === s2 && n1 === n2;
    k.push({ key: 'bhakoot', max: 7, score: (bad || sameStar) ? 0 : 7, p1: L(SIGN_EN[s1], SIGN_HI[s1]), p2: L(SIGN_EN[s2], SIGN_HI[s2]), distance: d });
    if (bad && (l1 === l2 || (REL[l1][l2] === 'F' && REL[l2][l1] === 'F')))
      notes.push({ key: 'bhakootLords' });

    var a1 = NADI_OF[n1], a2 = NADI_OF[n2];
    var nadiEased = a1 === a2 && s1 === s2 && n1 !== n2; // same rashi, different nakshatra (Drik Panchang applies this)
    k.push({ key: 'nadi', max: 8, score: a1 === a2 && !nadiEased ? 0 : 8, p1: NADI_NAMES[a1], p2: NADI_NAMES[a2] });
    if (a1 === a2) {
      var p1 = Math.floor((m1 % (360 / 27)) / (360 / 108)), p2 = Math.floor((m2 % (360 / 27)) / (360 / 108));
      if (n1 === n2 && p1 !== p2) notes.push({ key: 'nadiPada' });
      else if (s1 === s2 && n1 !== n2) notes.push({ key: 'nadiSign' });
      else if (l1 === l2) notes.push({ key: 'nadiLord' });
    }
    var total = 0; k.forEach(function (x) { total += x.score; });
    return { total: total, max: 36, kootas: k, notes: notes,
      p1: { rashi: s1, nak: n1, pada: Math.floor((m1 % (360 / 27)) / (360 / 108)) + 1 },
      p2: { rashi: s2, nak: n2, pada: Math.floor((m2 % (360 / 27)) / (360 / 108)) + 1 } };
  };

  PJ.milan = function (k1, k2) {
    var r = PJ.ashtakoot(k1.bodies.Moon.lon, k2.bodies.Moon.lon);
    r.timeUnknown = !!(k1.timeUnknown || k1.approximate || k2.timeUnknown || k2.approximate);
    r.manglik = { p1: k1.manglik, p2: k2.manglik };
    if (r.timeUnknown) return r;
    var m1 = k1.manglik.byLagna || k1.manglik.byMoon, m2 = k2.manglik.byLagna || k2.manglik.byMoon;
    if (m1 && m2) r.notes.push({ key: 'bothManglik' });
    return r;
  };
  PJ.ashtakoot.tables = { VARNA: VARNA, VASHYA: VASHYA, YONI: YONI, YONI_OF: YONI_OF, GANA: GANA, GANA_OF: GANA_OF, NADI_OF: NADI_OF, LORD: LORD, REL: REL };

}
