import Astronomy from '../vendor/astronomy.js';
import timezone from './timezone.js';
import ayanamsa from './ayanamsa.js';
import planets from './planets.js';
import nodes from './nodes.js';
import lagna from './lagna.js';
import nakshatra from './nakshatra.js';
import varga from './varga.js';
import dasha from './dasha.js';
import manglik from './manglik.js';
import engine from './engine.js';
import choghadiya from './choghadiya.js';
import hora from './hora.js';
import panchang from './panchang.js';
import sadeSati from './sade-sati.js';
import mahadasha from './mahadasha.js';
import ashtakoot from './ashtakoot.js';
/** Construct an isolated calculation context without modifying host globals. */
export function createCalculations() {
  const calc = {};
  for (const install of [timezone, ayanamsa, planets, nodes, lagna, nakshatra,
    varga, dasha, manglik, engine, choghadiya, hora, panchang, sadeSati, mahadasha, ashtakoot]) {
    install(calc, Astronomy);
  }
  return calc;
}
export { Astronomy };
