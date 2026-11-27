/** Internal calculation module. */
export default function install(PJ, Astronomy) {



  PJ.lagna = function (time, lat, lon) {
    var A = Astronomy, ast = PJ.astro, D = ast.D2R;
    var T = ast.centuriesTT(time);
    var nut = ast.nutation(T);
    var eps = (ast.meanObliquity(T) + nut.deps) * D;           // true obliquity
    var ramc = ast.norm360(A.SiderealTime(time) * 15 + lon) * D; // apparent local sidereal time
    var phi = lat * D;
    var asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)));
    var tropical = ast.norm360(asc / D);                        // true equinox of date
    // The ascendant is the eastern intersection of ecliptic and horizon.
    // Project the equatorial unit vector onto the local east direction.
    // At polar latitudes atan2 alone can select the setting intersection.
    var lambda = tropical * D;
    var east = -Math.sin(ramc) * Math.cos(lambda) +
      Math.cos(ramc) * Math.sin(lambda) * Math.cos(eps);
    if (east < 0) tropical = ast.norm360(tropical + 180);
    return ast.norm360(tropical - ast.ayanamsaTrue(T));
  };

}
