const test = require('node:test');
const assert = require('node:assert');
const { checkAvailability, findNextAvailableSlot } = require('../src/utils/calendarAvailability');

const calendar = {
  timezone: 'UTC',
  workingHours: { start: '09:00', end: '17:00', days: [1, 2, 3, 4, 5] }, // Mon-Fri
  busy: [{ start: '2026-07-13T14:00:00.000Z', end: '2026-07-13T15:00:00.000Z', title: 'Standup' }], // a Monday
};

test('checkAvailability rejects a time that conflicts with an existing busy block', () => {
  const result = checkAvailability(calendar, '2026-07-13T14:30:00.000Z', '2026-07-13T15:00:00.000Z');
  assert.strictEqual(result.available, false);
  assert.ok(result.reasons[0].includes('Standup'));
});

test('checkAvailability accepts an open slot within working hours', () => {
  const result = checkAvailability(calendar, '2026-07-13T10:00:00.000Z', '2026-07-13T10:30:00.000Z');
  assert.strictEqual(result.available, true);
});

test('checkAvailability rejects a time outside configured working hours', () => {
  const result = checkAvailability(calendar, '2026-07-13T20:00:00.000Z', '2026-07-13T20:30:00.000Z');
  assert.strictEqual(result.available, false);
  assert.ok(result.reasons.some((r) => r.includes('working hours')));
});

test('checkAvailability rejects a weekend day per workingHours.days', () => {
  // 2026-07-12 is a Sunday
  const result = checkAvailability(calendar, '2026-07-12T10:00:00.000Z', '2026-07-12T10:30:00.000Z');
  assert.strictEqual(result.available, false);
});

test('checkAvailability with no calendar configured returns null (unknown), not false', () => {
  const result = checkAvailability(null, '2026-07-13T10:00:00.000Z', '2026-07-13T10:30:00.000Z');
  assert.strictEqual(result.available, null);
});

test('findNextAvailableSlot returns a slot that is actually available', () => {
  const from = new Date('2026-07-13T13:00:00.000Z'); // Monday, right before the busy block
  const slot = findNextAvailableSlot(calendar, 30, from, 14);
  assert.ok(slot);
  const check = checkAvailability(calendar, slot.start, slot.end);
  assert.strictEqual(check.available, true);
});
