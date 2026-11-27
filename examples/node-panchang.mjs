import { panchang } from '../dist/index.js';
const result = panchang('2000-01-01', { name: 'Delhi', lat: 28.6139, lon: 77.209, tz: 'Asia/Kolkata' });
console.log(JSON.stringify(result, null, 2));
