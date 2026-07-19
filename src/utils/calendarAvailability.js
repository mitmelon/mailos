/**
 * Deterministic calendar availability — intentionally NOT AI-judged. The AI
 * extracts a proposed time from an email (language understanding, its job);
 * whether that time is actually free is a plain overlap check against
 * structured data (a fact, not a judgment call), same "code decides, AI
 * communicates" pattern as the negotiation policy gate.
 *
 * Calendar shape (set via mailbox.profile.calendar):
 *   {
 *     timezone: "America/New_York",
 *     workingHours: { start: "09:00", end: "17:00", days: [1,2,3,4,5] }, // 0=Sun
 *     busy: [{ start: ISOString, end: ISOString, title?: string }]
 *   }
 *
 * No external calendar sync (Google Calendar, etc.) is implemented here —
 * this is a structured JSON the owner maintains via the API. Honest scope:
 * it's a real, deterministic scheduling fact-checker, not a live calendar integration.
 */

function isWithinWorkingHours(date, workingHours) {
  if (!workingHours) return true;
  const day = date.getUTCDay();
  if (workingHours.days && !workingHours.days.includes(day)) return false;
  const [startH, startM] = (workingHours.start || '00:00').split(':').map(Number);
  const [endH, endM] = (workingHours.end || '23:59').split(':').map(Number);
  const minutesOfDay = date.getUTCHours() * 60 + date.getUTCMinutes();
  return minutesOfDay >= startH * 60 + startM && minutesOfDay <= endH * 60 + endM;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

/** Returns { available: boolean, reasons: string[] } for a proposed [start, end) window. */
function checkAvailability(calendar, proposedStart, proposedEnd) {
  if (!calendar) return { available: null, reasons: ['no calendar configured for this mailbox'] };
  const start = new Date(proposedStart);
  const end = new Date(proposedEnd);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { available: null, reasons: ['could not parse the proposed time'] };
  }

  const reasons = [];
  if (!isWithinWorkingHours(start, calendar.workingHours)) reasons.push('outside configured working hours');

  const conflicts = (calendar.busy || []).filter((b) => overlaps(start, end, new Date(b.start), new Date(b.end)));
  if (conflicts.length) reasons.push(`conflicts with: ${conflicts.map((c) => c.title || `${c.start}–${c.end}`).join(', ')}`);

  return { available: reasons.length === 0, reasons, conflicts };
}

/** Greedy scan for the next open working-hours slot of the requested duration, starting from `from`. */
function findNextAvailableSlot(calendar, durationMinutes, from = new Date(), searchDays = 14) {
  if (!calendar) return null;
  const stepMinutes = 30;
  const end = new Date(from.getTime() + searchDays * 24 * 60 * 60 * 1000);
  let cursor = new Date(Math.ceil(from.getTime() / (stepMinutes * 60 * 1000)) * (stepMinutes * 60 * 1000));

  while (cursor < end) {
    const slotEnd = new Date(cursor.getTime() + durationMinutes * 60 * 1000);
    const { available } = checkAvailability(calendar, cursor.toISOString(), slotEnd.toISOString());
    if (available) return { start: cursor.toISOString(), end: slotEnd.toISOString() };
    cursor = new Date(cursor.getTime() + stepMinutes * 60 * 1000);
  }
  return null;
}

module.exports = { checkAvailability, findNextAvailableSlot, isWithinWorkingHours, overlaps };
