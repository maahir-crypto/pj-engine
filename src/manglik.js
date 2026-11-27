/** Internal calculation module. */
export default function install(PJ, Astronomy) {


  var HOUSES = [1, 2, 4, 7, 8, 12];
  PJ.manglik = function (marsSign, lagnaSign, moonSign) {
    var fromLagna = PJ.houseOf(marsSign, lagnaSign), fromMoon = PJ.houseOf(marsSign, moonSign);
    var byLagna = HOUSES.indexOf(fromLagna) >= 0, byMoon = HOUSES.indexOf(fromMoon) >= 0;
    var exceptions = [];
    if (marsSign === 0 || marsSign === 7) exceptions.push('ownSign');   // Aries, Scorpio
    if (marsSign === 9) exceptions.push('exalted');                    // Capricorn
    if (byLagna && fromLagna === 2 && (marsSign === 2 || marsSign === 5)) exceptions.push('secondInMercurySign');
    if (byLagna && fromLagna === 12 && (marsSign === 1 || marsSign === 6)) exceptions.push('twelfthInVenusSign');
    if (byLagna && fromLagna === 4 && (marsSign === 0 || marsSign === 7)) exceptions.push('fourthOwnSign');
    if (byLagna && fromLagna === 7 && (marsSign === 3 || marsSign === 9)) exceptions.push('seventhCancerCapricorn');
    if (byLagna && fromLagna === 8 && (marsSign === 8 || marsSign === 11)) exceptions.push('eighthJupiterSign');
    return { fromLagna: fromLagna, fromMoon: fromMoon, byLagna: byLagna, byMoon: byMoon, exceptions: exceptions };
  };

}
