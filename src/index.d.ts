export type Instant = string | number | Date;
export type Planet = 'Sun'|'Moon'|'Mars'|'Mercury'|'Jupiter'|'Venus'|'Saturn'|'Rahu'|'Ketu';
export interface Place { name?: string; lat: number; lon: number; tz: string }
export interface BirthInput { year:number; month:number; day:number; hour:number; minute:number; lat:number; lon:number; tz?:string; offsetMinutes?:number; nodeMode?:'mean'|'true' }
export interface Bilingual { en:string; hi:string }
export interface LongitudeInfo { lon:number; sign:number; degInSign:number; nak:number; pada:number; d9?:number }
export interface BodyInfo extends LongitudeInfo { retro:boolean; speed:number; house:number; d9:number }
export interface DashaPeriod { lord:Planet; start:string; end:string; current?:boolean; sub?:DashaPeriod[] }
export interface Dasha { startLord:Planet; balanceYears:number; periods:DashaPeriod[]; YEARS:Record<Planet,number> }
export interface Manglik { [key:string]: unknown }
export interface Kundli { utc:string; offsetMinutes:number; tzNote:string|null; ayanamsa:number; nodeMode:'mean'|'true'; lagna:LongitudeInfo; bodies:Record<Planet,BodyInfo>; order:Planet[]; rashi:number; nakshatra:number; pada:number; dasha:Dasha; manglik:Manglik; timeUnknown?:boolean; approximate?:boolean }
export interface Interval { start:string; end:string }
export interface Limb { index:number; name:Bilingual; end:string|null }
export interface Tithi extends Limb { number:number; paksha:'shukla'|'krishna' }
export interface SolarDay { weekday:number; sunrise:string; sunset:string; nextSunrise:string; day:(Interval & {index:number;name:string;number?:number})[]; night:(Interval & {index:number;name:string;number?:number})[] }
export interface Choghadiya extends SolarDay { rahu:Interval; yamaganda:Interval; gulika:Interval; abhijit:Interval & {traditionallyUsed:boolean} }
export interface Panchang { date:string; city:Place; weekday:number; weekdayName:Bilingual; sunrise:string; sunset:string; nextSunrise:string; moonrise:string|null; moonset:string|null; tithi:Tithi; nextTithi:Tithi|null; nakshatra:Limb; yoga:Limb; karana:Limb; paksha:string; pakshaName:Bilingual; month:{purnimanta:Bilingual;amanta:Bilingual;purnimantaIndex:number|null;amantaIndex:number|null;nextPurnima:string|null;nextAmavasya:string|null}; solarMonth:{index:number;name:Bilingual;lon:number}; rahu:Interval; yamaganda:Interval; gulika:Interval; abhijit:Interval & {traditionallyUsed:boolean} }
export interface SaturnSpan { start:number; end:number; sign:number; phase?:number }
export interface SaturnCycle { start:number; end:number; spans:SaturnSpan[]; gaps:{start:number;end:number}[] }
export interface SadeSati { status:{house:number;phase:number;dhaiya:boolean}; cycle:SaturnCycle|null; previous?:SaturnCycle; dhaiya:SaturnSpan[] }
export interface Milan { total:number; max:number; kootas:{key:string;p1:Bilingual;p2:Bilingual;score:number;max:number;distance?:number}[]; notes:unknown[]; [key:string]:unknown }
export function kundli(input:BirthInput, now?:Instant):Kundli;
export function panchang(date:string, place:Place):Panchang|null;
export function vimshottariDasha(moonSiderealLongitude:number, birthInstant:Instant, now?:Instant):Dasha;
export function sadeSati(moonRashiIndex:number, now:Instant):SadeSati;
export function gunaMilan(kundliA:Kundli, kundliB:Kundli):Milan;
export function localToUtc(year:number,month:number,day:number,hour:number,minute:number,tz:string):{utc:string;offsetMinutes:number;note:string|null};
export function lahiriAyanamsa(date:Instant,mode?:'mean'|'true'):number;
export function nakshatraOf(longitude:number):LongitudeInfo & {name:Bilingual};
export function panchangAt(date:Instant):{tithi:number;karana:number;yoga:number;tithiEnd:string|null};
export function choghadiya(date:string,place:Place):Choghadiya|null;
export function hora(date:string,place:Place):SolarDay|null;
export function sankrantiInYear(year:number):{index:number;longitude:number;time:string;name:Bilingual}[];
export function mahadashaModel(dasha:Dasha,now:Instant):{periods:DashaPeriod[];maha?:DashaPeriod;antar?:DashaPeriod;pratyantar?:DashaPeriod;cycle:number};
export const names:Readonly<{SIGNS:{en:string[];hi:string[];rashi:string[]};NAK:{en:string[];hi:string[]};[key:string]:unknown}>;
