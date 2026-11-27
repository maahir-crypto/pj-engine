import { kundli } from '../dist/index.js';
// Fictional sample, no person is represented.
const chart = kundli({ year: 2000, month: 1, day: 1, hour: 12, minute: 0,
  lat: 28.6139, lon: 77.209, tz: 'Asia/Kolkata' }, '2026-01-01T00:00:00Z');
console.log(JSON.stringify(chart, null, 2));
