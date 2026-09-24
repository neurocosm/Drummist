const fs = require('fs');
const path = require('path');
const now = new Date();
const timeZone = 'America/New_York';
const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
  timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
}).formatToParts(now).map(({type, value}) => [type, value]));
const version = `v1.${parts.month}${parts.day}${parts.year}.${parts.hour}${parts.minute}`;
fs.writeFileSync(path.join(__dirname, '../src/release.json'), JSON.stringify({version, releasedAt: now.toISOString(), timeZone}, null, 2) + '\n');
console.log(version);
