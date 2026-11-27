/** Internal calculation module. */
export default function install(PJ, Astronomy) {


  PJ.navamsaSign = function (lon) { return Math.floor(lon / (30 / 9)) % 12; };

  PJ.houseOf = function (sign, lagnaSign) { return ((sign - lagnaSign + 12) % 12) + 1; };

}
