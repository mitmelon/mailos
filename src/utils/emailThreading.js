/** Strips Re:/Fwd:/Fw: prefixes (any repetition, any case) so subject-based thread matching is stable. */
function normalizeSubject(subject = '') {
  return subject.replace(/^\s*(re|fwd?|fw)\s*:\s*/i, '').trim().toLowerCase();
}

/** Extracts a bare email address from a "Name <email@x.com>" or plain "email@x.com" string. */
function extractEmailAddress(field = '') {
  const match = field.match(/<([^>]+)>/);
  return (match ? match[1] : field).trim().toLowerCase();
}

module.exports = { normalizeSubject, extractEmailAddress };
