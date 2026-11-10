const assert = require('node:assert/strict');
const { test } = require('node:test');
const { people, normalize, calendar } = require('../followup-data.js');

test('existing reminders retain their date when upgraded', () => {
  assert.deepEqual(normalize('2026-11-14T10:00:00+08:00'), {
    when: '2026-11-14T02:00:00.000Z', people: []
  });
  for (const value of [null, {}, 'invalid', { when: 'invalid' }]) assert.equal(normalize(value), null);
});

test('multiple names can be added, edited, cleared and restored from storage', () => {
  const reminder = { when: '2026-11-14T02:00:00.000Z', people: people('You, Jamie, Sarah, jamie, , Mei   Lin') };
  assert.deepEqual(reminder.people, ['You', 'Jamie', 'Sarah', 'Mei Lin']);
  assert.deepEqual(normalize(JSON.parse(JSON.stringify(reminder))), reminder);
  reminder.people = people('You, Sarah');
  assert.deepEqual(normalize(reminder).people, ['You', 'Sarah']);
  reminder.people = people(' , ');
  assert.deepEqual(normalize(reminder).people, []);
});

test('calendar includes names as notes, uses correct UTC time and safely folds Unicode', () => {
  const content = calendar({id: 10, title: 'Outing; lunch, together', detail: 'Meet at MRT\nBring snacks'}, {
    when: '2026-11-14T10:00:00+08:00', people: ['Jamie', 'Sarah', '张'.repeat(60)]
  }, new Date('2026-11-10T00:00:00Z'));
  const unfolded = content.replace(/\r\n /g, '');
  assert.ok(unfolded.includes('DTSTART:20261114T020000Z\r\nDTEND:20261114T023000Z'));
  assert.ok(unfolded.includes('SUMMARY:Outing\\; lunch\\, together'));
  assert.ok(unfolded.includes('DESCRIPTION:Meet at MRT\\nBring snacks\\nPeople involved: Jamie\\, Sarah\\, '));
  assert.ok(!unfolded.includes('ATTENDEE:'));
  assert.ok(!unfolded.includes('METHOD:REQUEST'));
  assert.ok(content.split('\r\n').every(line => Buffer.byteLength(line, 'utf8') <= 75));
});
