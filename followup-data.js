/* Names describe who is involved; they do not send invitations or grant access. */
var KeepsFollowups = (() => {
  function people(value) {
    const names = Array.isArray(value) ? value : String(value || '').split(/[,\n]/);
    const seen = new Set();
    return names.filter(name => typeof name === 'string').map(name => name.trim().replace(/\s+/g, ' '))
      .filter(name => {
        const key = name.toLocaleLowerCase();
        if (!name || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }
  function normalize(value) {
    // Dates saved by the previous version remain valid after this upgrade.
    const when = typeof value === 'string' ? value : value?.when;
    if (typeof when !== 'string' || !Number.isFinite(Date.parse(when))) return null;
    return { when: new Date(when).toISOString(), people: people(typeof value === 'object' ? value.people : []) };
  }
  function calendar(memory, followup, now = new Date()) {
    const fmt = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const escape = value => String(value).replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    const start = new Date(followup.when);
    const description = [memory.detail || 'Saved in Keeps', followup.people.length ? 'People involved: ' + followup.people.join(', ') : ''].filter(Boolean).join('\n');
    // RFC 5545 lines are folded at 75 UTF-8 octets, including continuation space.
    const fold = line => {
      let output = '', length = 0;
      for (const char of line) {
        const bytes = new TextEncoder().encode(char).length;
        if (length + bytes > 75) { output += '\r\n '; length = 1; }
        output += char; length += bytes;
      }
      return output;
    };
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Keeps//Followup//EN', 'BEGIN:VEVENT',
      `UID:keeps-${memory.id}-${start.getTime()}@local`, `DTSTAMP:${fmt(now)}`,
      `DTSTART:${fmt(start)}`, `DTEND:${fmt(new Date(+start + 1800000))}`,
      `SUMMARY:${escape(memory.title)}`, `DESCRIPTION:${escape(description)}`,
      'END:VEVENT', 'END:VCALENDAR', ''].map(fold).join('\r\n');
  }
  return Object.freeze({ people, normalize, calendar });
})();
if (typeof module !== 'undefined' && module.exports) module.exports = KeepsFollowups;
