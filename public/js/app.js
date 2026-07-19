const ICONS = {
  dashboard: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  mail: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l9 6 9-6"/><rect x="3" y="5" width="18" height="14" rx="2.5"/></svg>',
  handshake: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12l3 3 8-8"/><path d="M2 12l4-4 4 4-4 4z"/><path d="M12 16l2 2 8-8"/></svg>',
  brain: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M8 9.5c0-1.4 1.8-2.5 4-2.5s4 1.1 4 2.5-1.8 2.5-4 2.5-4 1.1-4 2.5 1.8 2.5 4 2.5"/></svg>',
  book: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  bulb: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/></svg>',
  message: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  settings: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
};

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: ICONS.dashboard, sub: 'Everything MailOS has handled for you.' },
  { id: 'mailboxes', label: 'Mailboxes', icon: ICONS.mail, sub: 'Connected inboxes and their configuration.' },
  { id: 'emails', label: 'Emails', icon: ICONS.message, sub: 'Every message processed - including what needs your attention.' },
  { id: 'negotiations', label: 'Negotiations', icon: ICONS.handshake, sub: 'Autonomous back-and-forth, handled or awaiting you.' },
  { id: 'memory', label: 'Memory', icon: ICONS.brain, sub: 'What MailOS remembers, ranked by recency, importance, and relevance.' },
  { id: 'knowledge', label: 'Knowledge', icon: ICONS.book, sub: 'Ideas and trends learned from newsletters.' },
  { id: 'opportunities', label: 'Opportunities', icon: ICONS.bulb, sub: 'Business signals surfaced from your inbox.' },
  { id: 'ask', label: 'Ask MailOS', icon: ICONS.message, sub: 'Ask anything MailOS has learned.' },
  { id: 'settings', label: 'Settings', icon: ICONS.settings, sub: 'Provider keys, negotiation policy, agent status.' },
];

let mailboxesCache = [];

/* Bootstrapping */
async function boot() {
  try {
    const { user } = await api.get('/auth/me');
    document.getElementById('user-name').textContent = user.username;
    document.getElementById('user-avatar').textContent = user.username.slice(0, 2).toUpperCase();
  } catch (err) {
    // api.js handles 401 redirect, if we're here it's another error
    // but still redirect to login to be safe
    if (!window.location.href.includes('login.html')) {
      window.location.href = '/login.html';
    }
    return;
  }

  renderSidebar();
  wireDelegatedActions();
  wireStaticActions();
  loadVersion();
  switchView('dashboard');
}

function renderSidebar() {
  const nav = document.getElementById('nav-main');
  nav.innerHTML = NAV.map((item) => `
    <div class="nav-item" data-action="switch-view" data-id="${item.id}">
      ${item.icon}
      <span>${item.label}</span>
    </div>
  `).join('');
}

function switchView(viewId) {
  document.querySelectorAll('.nav-item').forEach((el) => el.classList.toggle('active', el.dataset.id === viewId));
  document.querySelectorAll('.view').forEach((el) => el.classList.toggle('active', el.id === `view-${viewId}`));
  const item = NAV.find((n) => n.id === viewId);
  if (item) {
    document.getElementById('page-title').textContent = item.label;
    document.getElementById('page-sub').textContent = item.sub;
  }
  const loaders = {
    dashboard: loadDashboard, mailboxes: loadMailboxes, emails: () => loadEmails(''), negotiations: () => loadNegotiations(''),
    memory: loadMemory, knowledge: loadKnowledge, opportunities: loadOpportunities, settings: loadSettings,
  };
  if (loaders[viewId]) loaders[viewId]();
}

/* CSP-safe event delegation - no inline onclick attributes anywhere */
function wireDelegatedActions() {
  document.body.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    const id = el.dataset.id;
    const docId = el.dataset.docId;

    const handlers = {
      'switch-view': () => switchView(id),
      'go-ask': () => switchView('ask'),
      'open-connect-modal': () => openConnectModal(),
      'open-start-negotiation-modal': () => openStartNegotiationModal(),
      'refresh-report': () => loadDashboard(),
      'search-memory': () => loadMemory(),
      'consolidate-memory': () => runConsolidation(),
      'submit-ask': () => submitAsk(),
      'save-settings': () => saveSettings(),
      'sync-mailbox': () => syncMailbox(id),
      'open-profile-modal': () => openProfileModal(id),
      'disconnect-mailbox': () => disconnectMailbox(id),
      'delete-document': () => deleteDocument(id, docId),
      'open-negotiation-detail': () => openNegotiationDetail(id),
      'resume-negotiation': () => resumeNegotiation(id),
      'close-modal': () => closeModal(),
      'unblock-login': () => unblockLogin(id),
      'trigger-update': () => triggerUpdate(),
      'switch-tab': () => switchTab(el),
      'send-draft': () => sendDraft(id),
      'dismiss-email': () => dismissEmail(id),
      'open-email-detail': () => openEmailDetail(id),
      'open-memory-detail': () => openMemoryDetail(id),
    };
    if (handlers[action]) handlers[action]();
  });
}

function wireStaticActions() {
  document.getElementById('logout-trigger').addEventListener('click', async () => {
    await api.post('/auth/logout');
    window.location.href = '/login.html';
  });
  document.getElementById('memory-search').addEventListener('keydown', (e) => { if (e.key === 'Enter') loadMemory(); });
  document.getElementById('ask-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitAsk(); });
  document.querySelectorAll('#theme-toggle button').forEach((btn) => {
    btn.addEventListener('click', () => setTheme(btn.dataset.themeChoice));
  });
  document.querySelectorAll('#negotiation-tabs .tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#negotiation-tabs .tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      loadNegotiations(tab.dataset.status);
    });
  });
  document.querySelectorAll('#email-tabs .tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#email-tabs .tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      loadEmails(tab.dataset.status);
    });
  });
  applyThemeButtons();
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('mailos-theme', theme);
  applyThemeButtons();
}
function applyThemeButtons() {
  const current = localStorage.getItem('mailos-theme') || 'light';
  document.querySelectorAll('#theme-toggle button').forEach((b) => b.classList.toggle('active', b.dataset.themeChoice === current));
}

/* Utilities */
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function relTime(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
function skeleton(count = 3, height = 64) {
  return Array.from({ length: count }).map(() => `<div class="shimmer" style="height:${height}px; margin-bottom:10px;"></div>`).join('');
}
function statusBadge(status) {
  const map = {
    connected: ['green', 'Connected'], reconnecting: ['amber', 'Reconnecting'], disconnected: ['red', 'Disconnected'],
    open: ['green', 'Negotiating'], agreed: ['green', 'Agreed'], escalated: ['amber', 'Needs you'],
  };
  const [color, label] = map[status] || ['gray', status];
  return `<span class="badge badge-${color}"><span class="badge-dot"></span>${label}</span>`;
}
function switchTab(tabEl) {
  const group = tabEl.parentElement;
  group.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
  tabEl.classList.add('active');
  document.querySelectorAll(`[data-pane-group="${group.id}"]`).forEach((p) => {
    p.style.display = p.dataset.pane === tabEl.dataset.tab ? 'block' : 'none';
  });
}

/* Modal helper */
function openModal(innerHtml) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-backdrop" id="modal-backdrop"><div class="modal-panel">${innerHtml}</div></div>`;
  document.getElementById('modal-backdrop').addEventListener('click', (e) => { if (e.target.id === 'modal-backdrop') closeModal(); });
}
function closeModal() { document.getElementById('modal-root').innerHTML = ''; }

/* Version / update check */
async function loadVersion() {
  try {
    const v = await api.get('/system/version');
    document.getElementById('version-label').textContent = `v${v.version}`;
  } catch { /* non-critical */ }
  try {
    const u = await api.get('/system/update-check');
    if (u.updateAvailable) {
      document.getElementById('update-banner').innerHTML = `
        <div class="update-banner">
          <span>A new MailOS version (${escapeHtml(u.latestVersion)}) is available - you're on ${escapeHtml(u.currentVersion)}.</span>
          <button class="btn btn-primary btn-sm" data-action="trigger-update">Update now</button>
        </div>`;
    }
  } catch { /* update checks are best-effort */ }
}

async function triggerUpdate() {
  if (!confirm('This pulls the latest code, reinstalls dependencies, and restarts the server. Your data is untouched. Continue?')) return;
  try {
    const r = await api.post('/system/update');
    toast.success(r.message || 'Updating...');
  } catch (err) { toast.error(err.message); }
}

/* DASHBOARD */
async function loadDashboard() {
  const grid = document.getElementById('stat-grid');
  grid.innerHTML = skeleton(6, 88);
  try {
    const [metrics, mailboxes] = await Promise.all([api.get('/dashboard'), api.get('/mailboxes')]);
    mailboxesCache = mailboxes.mailboxes;
    document.getElementById('dashboard-empty').style.display = mailboxesCache.length === 0 ? 'flex' : 'none';

    const cards = [
      ['Emails received', metrics.emailsProcessed],
      ['Emails sent', metrics.emailsSent],
      ['Threats blocked', metrics.threatsBlocked],
      ['Handled automatically', metrics.handledAutomatically],
      ['Needs your attention', metrics.requiresAttention],
      ['Knowledge learned', metrics.knowledgeLearned],
      ['Opportunities found', metrics.opportunitiesDiscovered],
    ];
    grid.innerHTML = cards.map(([label, value]) => `
      <div class="glass-card stat-card">
        <p class="stat-label">${label}</p>
        <p class="stat-value">${value ?? 0}</p>
      </div>
    `).join('') + `
      <div class="glass-card stat-card" style="background:linear-gradient(180deg, rgba(23,132,90,0.08), rgba(23,132,90,0.02)); border-color:rgba(23,132,90,0.2);">
        <p class="stat-label">Attention saved</p>
        <p class="stat-value">${metrics.estimatedAttentionSaved?.humanReadable || '0h 0m'}</p>
      </div>
    `;
  } catch (err) {
    grid.innerHTML = `<p class="text-secondary">Couldn't load metrics: ${escapeHtml(err.message)}</p>`;
  }

  const report = document.getElementById('daily-report');
  report.innerHTML = skeleton(1, 140);
  try {
    const r = await api.get('/daily-report');
    report.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:16px;">
        <span style="font-size:13px; color:var(--text-secondary)">Last 24 hours</span>
        <span style="font-size:13px; font-weight:500;">${r.estimatedAttentionSaved?.humanReadable || '0h 0m'} saved</span>
      </div>
      <div class="kv-row"><span>Received</span><span>${r.emailsProcessed}</span></div>
      <div class="kv-row"><span>Sent</span><span>${r.emailsSent ?? 0}</span></div>
      <div class="kv-row"><span>Handled automatically</span><span>${r.handledAutomatically}</span></div>
      <div class="kv-row"><span>Needed your attention</span><span>${r.neededAttention}</span></div>
      <div class="kv-row"><span>Threats blocked</span><span>${r.threatsBlocked}</span></div>
      ${r.knowledgeLearned?.length ? `<div style="margin-top:16px;"><p style="font-size:12px; color:var(--text-secondary); margin:0 0 8px;">New knowledge</p>${r.knowledgeLearned.map((k) => `<p style="font-size:13px; margin:0 0 6px; padding-left:12px; border-left:2px solid var(--border);">${escapeHtml(k)}</p>`).join('')}</div>` : ''}
      ${r.opportunities?.length ? `<div style="margin-top:16px;"><p style="font-size:12px; color:var(--text-secondary); margin:0 0 8px;">Opportunities</p>${r.opportunities.map((o) => `<p style="font-size:13px; margin:0 0 6px; padding-left:12px; border-left:2px solid var(--border);">${escapeHtml(o)}</p>`).join('')}</div>` : ''}
    `;
  } catch (err) {
    report.innerHTML = `<p class="text-secondary">Couldn't load report: ${escapeHtml(err.message)}</p>`;
  }

  const mgrid = document.getElementById('mailbox-stat-grid');
  mgrid.innerHTML = skeleton(2, 120);
  try {
    const { mailboxes } = await api.get('/dashboard/mailboxes');
    if (!mailboxes.length) { mgrid.innerHTML = ''; return; }
    mgrid.innerHTML = mailboxes.map((m) => `
      <div class="glass-card" style="padding:18px 20px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
          <span style="font-weight:600; font-size:13.5px;">${escapeHtml(m.label)}</span>
          ${statusBadge(m.status)}
        </div>
        <div class="kv-row"><span>Received</span><span>${m.metrics.emailsProcessed}</span></div>
        <div class="kv-row"><span>Sent</span><span>${m.metrics.emailsSent}</span></div>
        <div class="kv-row"><span>Opportunities</span><span>${m.metrics.opportunitiesDiscovered}</span></div>
        <div class="kv-row"><span>Knowledge learned</span><span>${m.metrics.knowledgeLearned}</span></div>
      </div>
    `).join('');
  } catch (err) {
    mgrid.innerHTML = `<p class="text-secondary">${escapeHtml(err.message)}</p>`;
  }
}

/* MAILBOXES */
async function loadMailboxes() {
  const list = document.getElementById('mailbox-list');
  list.innerHTML = skeleton(2, 90);
  try {
    const { mailboxes } = await api.get('/mailboxes');
    mailboxesCache = mailboxes;
    if (!mailboxes.length) {
      list.innerHTML = `<div class="empty-state glass-card"><p>No mailboxes connected yet.</p><button class="btn btn-primary" data-action="open-connect-modal" style="margin-top:14px;">Connect email</button></div>`;
      return;
    }
    list.innerHTML = mailboxes.map((m) => `
      <div class="glass-card list-item">
        <div class="list-row">
          <div style="min-width:0;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:5px;">
              <span style="font-weight:600; font-size:14px;">${escapeHtml(m.label || m.emailAddress)}</span>
              ${statusBadge(m.status)}
            </div>
            <p style="font-size:12.5px; color:var(--text-secondary); margin:0;">${escapeHtml(m.emailAddress)} · synced ${relTime(m.lastSyncAt)} · ${m.sentCount || 0} sent</p>
          </div>
          <div style="display:flex; gap:8px; flex-shrink:0;">
            <button class="btn btn-secondary btn-sm" data-action="sync-mailbox" data-id="${m.id}">Sync</button>
            <button class="btn btn-secondary btn-sm" data-action="open-profile-modal" data-id="${m.id}">Profile</button>
            <a class="btn btn-secondary btn-sm" href="/mailboxes/${m.id}/backup">Backup</a>
            <button class="icon-btn" data-action="disconnect-mailbox" data-id="${m.id}" title="Disconnect">${ICONS.trash}</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p class="text-secondary">Couldn't load mailboxes: ${escapeHtml(err.message)}</p>`;
  }
}

async function syncMailbox(id) {
  try { await api.post('/sync', { mailboxId: id }); toast.success('Sync triggered'); loadMailboxes(); }
  catch (err) { toast.error(err.message); }
}
async function disconnectMailbox(id) {
  if (!confirm('Disconnect this mailbox? MailOS will stop monitoring it.')) return;
  try { await api.post('/disconnect-email', { mailboxId: id }); toast.success('Mailbox disconnected'); loadMailboxes(); }
  catch (err) { toast.error(err.message); }
}

function openConnectModal() {
  openModal(`
    <div style="padding:28px 28px 24px;">
      <h3 style="font-size:17px; font-weight:600; margin:0 0 5px;">Connect a mailbox</h3>
      <p style="font-size:13px; color:var(--text-secondary); margin:0 0 22px;">Works with any IMAP/SMTP provider — Gmail, Outlook, Yahoo, self-hosted.</p>
      <form id="connect-form">
        <div class="field"><label class="field-label">Label</label><input class="input" name="label" placeholder="Support inbox"></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; gap:14px;">
          <div class="field"><label class="field-label">IMAP host</label><input class="input" name="host" placeholder="imap.gmail.com" required></div>
          <div class="field"><label class="field-label">Port</label><input class="input" name="port" type="number" value="993"></div>
        </div>
        <div class="field"><label class="field-label">Username</label><input class="input" name="user" placeholder="you@example.com" required></div>
        <div class="field"><label class="field-label">Password / app password</label><input class="input" name="password" type="password" required></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; gap:14px;">
          <div class="field"><label class="field-label">SMTP host</label><input class="input" name="smtpHost" placeholder="smtp.gmail.com" required></div>
          <div class="field"><label class="field-label">Port</label><input class="input" name="smtpPort" type="number" value="587"></div>
        </div>
        <div class="field"><label class="field-label">Escalation webhook (optional)</label><input class="input" name="webhookUrl" placeholder="https://..."></div>
        <p id="connect-err" style="color:var(--accent-red); font-size:13px; min-height:0; margin:0 0 6px;"></p>
        <div style="display:flex; gap:10px; margin-top:10px;">
          <button type="button" class="btn btn-ghost" data-action="close-modal" style="flex:1;">Cancel</button>
          <button type="submit" class="btn btn-primary" style="flex:1;" id="connect-submit">Connect</button>
        </div>
      </form>
    </div>
  `);
  document.getElementById('connect-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    body.port = parseInt(body.port, 10);
    body.smtpPort = parseInt(body.smtpPort, 10);
    body.tls = true;
    if (!body.webhookUrl) delete body.webhookUrl;
    const btn = document.getElementById('connect-submit');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
    try {
      await api.post('/connect-email', body);
      toast.success('Mailbox connected — monitoring started, pulling recent history now');
      closeModal();
      loadMailboxes(); loadDashboard();
    } catch (err) {
      document.getElementById('connect-err').textContent = err.message;
      btn.disabled = false; btn.textContent = 'Connect';
    }
  });
}

async function openProfileModal(mailboxId) {
  openModal(`<div style="padding:28px;">${skeleton(4, 50)}</div>`);
  const { profile } = await api.get(`/mailboxes/${mailboxId}/profile`);
  openModal(`
    <div style="padding:28px 28px 24px;">
      <h3 style="font-size:17px; font-weight:600; margin:0 0 20px;">Mailbox profile</h3>
      <div class="tabs" id="profile-tabs">
        <div class="tab active" data-action="switch-tab" data-tab="general">General</div>
        <div class="tab" data-action="switch-tab" data-tab="calendar">Calendar</div>
        <div class="tab" data-action="switch-tab" data-tab="documents">Documents</div>
      </div>

      <div data-pane-group="profile-tabs" data-pane="general">
        <div class="field"><label class="field-label">Location</label><input class="input" id="pf-location" value="${escapeHtml(profile.location || '')}" placeholder="Austin, TX"></div>
        <div class="field"><label class="field-label">Priorities / rules (one per line)</label><textarea class="input" id="pf-priorities" rows="3" placeholder="Never discuss pricing without approval">${escapeHtml((profile.priorities || []).join('\n'))}</textarea></div>
        <div class="field"><label class="field-label">Preferences (JSON)</label><textarea class="input mono" id="pf-preferences" rows="3" placeholder='{"stockWatchlist": ["AAPL"]}'>${escapeHtml(JSON.stringify(profile.preferences || {}, null, 2))}</textarea></div>
      </div>

      <div data-pane-group="profile-tabs" data-pane="calendar" style="display:none;">
        <div class="field"><label class="field-label">Timezone</label><input class="input" id="pf-tz" value="${escapeHtml(profile.calendar?.timezone || 'UTC')}"></div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
          <div class="field"><label class="field-label">Working hours start</label><input class="input" id="pf-wh-start" value="${escapeHtml(profile.calendar?.workingHours?.start || '09:00')}"></div>
          <div class="field"><label class="field-label">Working hours end</label><input class="input" id="pf-wh-end" value="${escapeHtml(profile.calendar?.workingHours?.end || '17:00')}"></div>
        </div>
        <div class="field"><label class="field-label">Busy blocks (JSON array)</label><textarea class="input mono" id="pf-busy" rows="4" placeholder='[{"start":"2026-07-14T14:00:00Z","end":"2026-07-14T15:00:00Z","title":"Standup"}]'>${escapeHtml(JSON.stringify(profile.calendar?.busy || [], null, 2))}</textarea></div>
      </div>

      <div data-pane-group="profile-tabs" data-pane="documents" style="display:none;">
        <div id="pf-doc-list">${(profile.documents || []).map((d) => `
          <div class="glass-card" style="padding:11px 15px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:13px;">${escapeHtml(d.name)}</span>
            <button class="icon-btn" data-action="delete-document" data-id="${mailboxId}" data-doc-id="${d.id}">${ICONS.trash}</button>
          </div>
        `).join('') || '<p class="text-secondary" style="font-size:13px;">No documents yet.</p>'}</div>
        <div style="margin-top:16px; border-top:1px solid var(--border); padding-top:16px;">
          <div class="field"><label class="field-label">Document name</label><input class="input" id="pf-doc-name" placeholder="Refund policy"></div>
          <div class="field"><label class="field-label">Content</label><textarea class="input" id="pf-doc-content" rows="3" placeholder="Plain text or markdown"></textarea></div>
          <button class="btn btn-secondary btn-sm" id="pf-doc-add">Add document</button>
        </div>
      </div>

      <div style="display:flex; gap:10px; margin-top:22px;">
        <button type="button" class="btn btn-ghost" data-action="close-modal" style="flex:1;">Close</button>
        <button type="button" class="btn btn-primary" style="flex:1;" id="pf-save">Save profile</button>
      </div>
    </div>
  `);

  document.getElementById('pf-doc-add').addEventListener('click', async () => {
    const name = document.getElementById('pf-doc-name').value.trim();
    const content = document.getElementById('pf-doc-content').value.trim();
    if (!name || !content) return toast.error('Name and content are required');
    try { await api.post(`/mailboxes/${mailboxId}/documents`, { name, content }); toast.success('Document added'); openProfileModal(mailboxId); }
    catch (err) { toast.error(err.message); }
  });

  document.getElementById('pf-save').addEventListener('click', async () => {
    let preferences, busy;
    try { preferences = JSON.parse(document.getElementById('pf-preferences').value || '{}'); }
    catch { return toast.error('Preferences must be valid JSON'); }
    try { busy = JSON.parse(document.getElementById('pf-busy').value || '[]'); }
    catch { return toast.error('Busy blocks must be a valid JSON array'); }

    const patch = {
      location: document.getElementById('pf-location').value.trim() || null,
      priorities: document.getElementById('pf-priorities').value.split('\n').map((s) => s.trim()).filter(Boolean),
      preferences,
      calendar: {
        timezone: document.getElementById('pf-tz').value.trim() || 'UTC',
        workingHours: { start: document.getElementById('pf-wh-start').value, end: document.getElementById('pf-wh-end').value, days: [1, 2, 3, 4, 5] },
        busy,
      },
    };
    try { await api.patch(`/mailboxes/${mailboxId}`, { profile: patch }); toast.success('Profile saved'); closeModal(); }
    catch (err) { toast.error(err.message); }
  });
}

async function deleteDocument(mailboxId, docId) {
  try { await api.del(`/mailboxes/${mailboxId}/documents/${docId}`); toast.success('Document removed'); openProfileModal(mailboxId); }
  catch (err) { toast.error(err.message); }
}

/* EMAILS - the "what needs my attention" view */
async function loadEmails(status) {
  const list = document.getElementById('email-list');
  list.innerHTML = skeleton(4, 76);
  try {
    const query = status === 'blocked' ? '?status=blocked' : (status ? `?action=${status}` : '');
    const { emails } = await api.get(`/emails${query}`);
    if (!emails.length) { list.innerHTML = `<div class="empty-state glass-card"><p>Nothing here.</p></div>`; return; }
    list.innerHTML = emails.map((e) => `
      <div class="glass-card list-item" style="cursor:pointer;" data-action="open-email-detail" data-id="${e.id}">
        <div class="list-row">
          <div style="min-width:0; flex:1;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:5px; flex-wrap:wrap;">
              <span style="font-weight:600; font-size:14px;">${escapeHtml(e.subject)}</span>
              ${e.classification?.label ? `<span class="badge badge-gray">${escapeHtml(e.classification.label)}</span>` : ''}
              ${emailStatusBadge(e)}
            </div>
            <p style="font-size:12.5px; color:var(--text-secondary); margin:0;">from ${escapeHtml(e.from)} · ${relTime(e.createdAt)}</p>
          </div>
          ${e.decision?.action === 'requires_human' && !e.resolvedByOwner ? `
            <div style="display:flex; gap:8px;">
              ${e.draftReply ? `<button class="btn btn-secondary btn-sm" data-action="send-draft" data-id="${e.id}">Send draft</button>` : ''}
              <button class="btn btn-ghost btn-sm" data-action="dismiss-email" data-id="${e.id}">Dismiss</button>
            </div>` : ''}
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p class="text-secondary">Couldn't load emails: ${escapeHtml(err.message)}</p>`;
  }
}

function emailStatusBadge(e) {
  if (e.status === 'blocked') return `<span class="badge badge-red"><span class="badge-dot"></span>Blocked</span>`;
  if (e.decision?.action === 'requires_human') return `<span class="badge badge-amber"><span class="badge-dot"></span>Needs attention</span>`;
  if (e.decision?.action === 'notify') return `<span class="badge badge-amber"><span class="badge-dot"></span>Notify</span>`;
  if (e.decision?.action) return `<span class="badge badge-green"><span class="badge-dot"></span>${escapeHtml(e.decision.action)}</span>`;
  return '';
}

async function openEmailDetail(id) {
  openModal(`<div style="padding:28px;">${skeleton(3, 60)}</div>`);
  try {
    const { email: e } = await api.get(`/emails/${id}`);
    openModal(`
      <div style="padding:28px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; gap:12px;">
          <div>
            <h3 style="font-size:16.5px; font-weight:600; margin:0 0 5px;">${escapeHtml(e.subject)}</h3>
            <p style="font-size:13px; color:var(--text-secondary); margin:0;">from ${escapeHtml(e.from)} · ${relTime(e.createdAt)}</p>
          </div>
          ${emailStatusBadge(e)}
        </div>
        ${e.decision?.reason ? `<div class="glass-card" style="padding:12px 15px; margin-bottom:16px;"><p style="font-size:13px; margin:0;"><strong>Why:</strong> ${escapeHtml(e.decision.reason)}</p></div>` : ''}
        <p style="font-size:12px; color:var(--text-secondary); margin:0 0 8px; text-transform:uppercase; letter-spacing:0.04em;">Message</p>
        <div class="glass-card" style="padding:14px 16px; max-height:220px; overflow-y:auto; margin-bottom:18px;">
          <p style="font-size:13.5px; white-space:pre-wrap; margin:0;">${escapeHtml((e.text || '').slice(0, 3000)) || '(no text content)'}</p>
        </div>
        ${e.draftReply ? `
          <p style="font-size:12px; color:var(--text-secondary); margin:0 0 8px; text-transform:uppercase; letter-spacing:0.04em;">Drafted reply</p>
          <div class="glass-card" style="padding:14px 16px; margin-bottom:18px;">
            <p style="font-size:13.5px; white-space:pre-wrap; margin:0;">${escapeHtml(e.draftReply)}</p>
          </div>` : ''}
        <div style="display:flex; gap:10px;">
          <button type="button" class="btn btn-ghost" data-action="close-modal" style="flex:1;">Close</button>
          ${e.decision?.action === 'requires_human' && !e.resolvedByOwner ? `
            ${e.draftReply ? `<button type="button" class="btn btn-primary" style="flex:1;" data-action="send-draft" data-id="${e.id}">Send draft</button>` : ''}
            <button type="button" class="btn btn-secondary" style="flex:1;" data-action="dismiss-email" data-id="${e.id}">Dismiss</button>` : ''}
        </div>
      </div>
    `);
  } catch (err) { toast.error(err.message); closeModal(); }
}

async function sendDraft(id) {
  try { await api.post(`/emails/${id}/send-draft`); toast.success('Reply sent'); closeModal(); loadEmails(''); loadDashboard(); }
  catch (err) { toast.error(err.message); }
}
async function dismissEmail(id) {
  try { await api.post(`/emails/${id}/dismiss`); toast.success('Dismissed'); closeModal(); loadEmails(''); }
  catch (err) { toast.error(err.message); }
}


async function loadNegotiations(status) {
  const list = document.getElementById('negotiation-list');
  list.innerHTML = skeleton(3, 78);
  try {
    const { negotiations } = await api.get(`/negotiations${status ? `?status=${status}` : ''}`);
    if (!negotiations.length) { list.innerHTML = `<div class="empty-state glass-card"><p>No negotiations here yet.</p></div>`; return; }
    list.innerHTML = negotiations.map((n) => `
      <div class="glass-card list-item" style="cursor:pointer;" data-action="open-negotiation-detail" data-id="${n.id}">
        <div class="list-row">
          <div style="min-width:0;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:5px;">
              <span style="font-weight:600; font-size:14px;">${escapeHtml(n.counterpartyEmail)}</span>
              ${statusBadge(n.status)}
            </div>
            <p style="font-size:12.5px; color:var(--text-secondary); margin:0;">${escapeHtml(n.subjectKey || '')} · round ${n.round || 0} · ${n.efficiency?.efficiencyGainPercent ?? 0}% efficiency gain</p>
          </div>
          ${n.status === 'escalated' ? `<button class="btn btn-secondary btn-sm" data-action="resume-negotiation" data-id="${n.id}">Resume</button>` : ''}
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p class="text-secondary">Couldn't load negotiations: ${escapeHtml(err.message)}</p>`;
  }
}

async function resumeNegotiation(id) {
  try { await api.post(`/negotiations/${id}/resume`); toast.success('Negotiation resumed'); loadNegotiations(''); }
  catch (err) { toast.error(err.message); }
}

async function openNegotiationDetail(id) {
  openModal(`<div style="padding:28px;">${skeleton(3, 60)}</div>`);
  try {
    const { negotiation: n } = await api.get(`/negotiations/${id}`);
    openModal(`
      <div style="padding:28px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px;">
          <div>
            <h3 style="font-size:17px; font-weight:600; margin:0 0 5px;">${escapeHtml(n.counterpartyEmail)}</h3>
            <p style="font-size:13px; color:var(--text-secondary); margin:0;">${escapeHtml(n.subjectKey || '')}</p>
          </div>
          ${statusBadge(n.status)}
        </div>
        ${n.escalatedReason ? `<div class="glass-card" style="padding:13px 15px; margin-bottom:18px; border-color:rgba(179,115,10,0.3); background:rgba(179,115,10,0.06);"><p style="font-size:13px; margin:0;">${escapeHtml(n.escalatedReason)}</p></div>` : ''}

        <p style="font-size:12px; color:var(--text-secondary); margin:0 0 8px; text-transform:uppercase; letter-spacing:0.04em;">Efficiency</p>
        <div class="kv-row"><span>Rounds automated</span><span>${n.efficiency.roundsAutomated}</span></div>
        <div class="kv-row"><span>Real tokens used</span><span>${n.efficiency.realTokensUsed}</span></div>
        <div class="kv-row"><span>Human minutes saved</span><span>${n.efficiency.humanMinutesSaved}</span></div>
        <div class="kv-row"><span>Efficiency gain</span><span>${n.efficiency.efficiencyGainPercent}%</span></div>

        <p style="font-size:12px; color:var(--text-secondary); margin:20px 0 8px; text-transform:uppercase; letter-spacing:0.04em;">Offer history</p>
        <div style="max-height:200px; overflow-y:auto;">
          ${(n.offers || []).map((o) => `
            <div style="display:flex; gap:10px; padding:9px 0; border-bottom:1px solid var(--border); font-size:12.5px;">
              <span class="badge badge-gray" style="flex-shrink:0;">R${o.round} · ${o.from}</span>
              <span class="text-secondary mono" style="word-break:break-all;">${escapeHtml(JSON.stringify(o.terms))}</span>
            </div>
          `).join('') || '<p class="text-secondary" style="font-size:13px;">No offers recorded yet.</p>'}
        </div>

        <div style="display:flex; gap:10px; margin-top:22px;">
          <button type="button" class="btn btn-ghost" data-action="close-modal" style="flex:1;">Close</button>
          ${n.status === 'escalated' ? `<button type="button" class="btn btn-primary" style="flex:1;" data-action="resume-negotiation" data-id="${n.id}">Resume</button>` : ''}
        </div>
      </div>
    `);
  } catch (err) {
    toast.error(err.message);
    closeModal();
  }
}

async function openStartNegotiationModal() {
  if (!mailboxesCache.length) { const r = await api.get('/mailboxes'); mailboxesCache = r.mailboxes; }
  openModal(`
    <div style="padding:28px;">
      <h3 style="font-size:17px; font-weight:600; margin:0 0 5px;">Start a negotiation</h3>
      <p style="font-size:13px; color:var(--text-secondary); margin:0 0 20px;">Define a goal — MailOS drafts and sends the opening move.</p>
      <form id="start-neg-form">
        <div class="field"><label class="field-label">From mailbox</label>
          <select class="input" name="mailboxId" required>${mailboxesCache.map((m) => `<option value="${m.id}">${escapeHtml(m.label || m.emailAddress)}</option>`).join('')}</select>
        </div>
        <div class="field"><label class="field-label">To</label><input class="input" name="to" placeholder="seller@example.com" required></div>
        <div class="field"><label class="field-label">Subject</label><input class="input" name="subject" placeholder="Purchasing your software license" required></div>
        <div class="field"><label class="field-label">Goal</label><input class="input" name="goal" placeholder="Buy a 50-seat license" required></div>
        <div class="field"><label class="field-label">Description (optional)</label><textarea class="input" name="description" rows="4" placeholder="Describe the negotiation context, what you're trying to achieve, key points to mention, tone preferences, etc."></textarea></div>
        <div class="field"><label class="field-label">Constraints (JSON)</label><textarea class="input mono" name="constraints" rows="3" placeholder='{"maxPrice": 5000, "preferredPaymentTerms": "net-30"}'></textarea></div>
        <p id="start-neg-err" style="color:var(--accent-red); font-size:13px; min-height:0; margin:0 0 6px;"></p>
        <div style="display:flex; gap:10px; margin-top:10px;">
          <button type="button" class="btn btn-ghost" data-action="close-modal" style="flex:1;">Cancel</button>
          <button type="submit" class="btn btn-primary" style="flex:1;" id="start-neg-submit">Send opening move</button>
        </div>
      </form>
    </div>
  `);
  document.getElementById('start-neg-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    let constraints;
    try { constraints = JSON.parse(fd.get('constraints') || '{}'); }
    catch { document.getElementById('start-neg-err').textContent = 'Constraints must be valid JSON'; return; }
    const btn = document.getElementById('start-neg-submit');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
    try {
      const description = fd.get('description')?.trim() || null;
      await api.post('/negotiations', {
        mailboxId: fd.get('mailboxId'), to: fd.get('to'), subject: fd.get('subject'),
        intent: { type: 'negotiation', goal: fd.get('goal'), description, constraints },
      });
      toast.success('Opening move sent');
      closeModal();
      loadNegotiations('');
    } catch (err) {
      document.getElementById('start-neg-err').textContent = err.message;
      btn.disabled = false; btn.textContent = 'Send opening move';
    }
  });
}

/* MEMORY */
async function loadMemory() {
  const q = document.getElementById('memory-search').value.trim();
  const list = document.getElementById('memory-list');
  list.innerHTML = skeleton(4, 56);
  try {
    const data = await api.get(q ? `/memory?q=${encodeURIComponent(q)}` : '/memory');
    const items = data.results || data.memories || [];
    if (!items.length) { list.innerHTML = `<div class="empty-state glass-card"><p>No memories yet.</p></div>`; return; }
    list.innerHTML = items.map((m) => `
      <div class="glass-card list-item" style="cursor:pointer;" data-action="open-memory-detail" data-id="${m.id}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:14px;">
          <p style="font-size:13.5px; margin:0; flex:1;">${escapeHtml(m.text)}</p>
          <span class="badge badge-gray" style="flex-shrink:0;">${escapeHtml(m.type || 'fact')}</span>
        </div>
        <p style="font-size:11.5px; color:var(--text-muted); margin:9px 0 0;">importance ${(m.importance ?? 0).toFixed(2)} · accessed ${m.accessCount || 0}× · ${m.tier || 'episodic'}</p>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p class="text-secondary">Couldn't load memory: ${escapeHtml(err.message)}</p>`;
  }
}

async function openMemoryDetail(id) {
  openModal(`<div style="padding:28px;">${skeleton(2, 60)}</div>`);
  try {
    const { memory: m, sourceMemories, sourceEmail } = await api.get(`/memory/${id}`);
    openModal(`
      <div style="padding:28px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; gap:12px;">
          <span class="badge badge-gray">${escapeHtml(m.type || 'fact')} · ${escapeHtml(m.tier || 'episodic')}</span>
        </div>
        <p style="font-size:15px; line-height:1.55; margin:0 0 18px;">${escapeHtml(m.text)}</p>
        <div class="kv-row"><span>Importance</span><span>${(m.importance ?? 0).toFixed(2)}</span></div>
        <div class="kv-row"><span>Accessed</span><span>${m.accessCount || 0} times</span></div>
        <div class="kv-row"><span>Last accessed</span><span>${relTime(m.lastAccessedAt)}</span></div>
        <div class="kv-row"><span>Created</span><span>${relTime(m.createdAt)}</span></div>
        ${m.archived ? `<div class="kv-row"><span>Status</span><span>Archived (excluded from search)</span></div>` : ''}
        ${sourceEmail ? `
          <p style="font-size:12px; color:var(--text-secondary); margin:18px 0 8px; text-transform:uppercase; letter-spacing:0.04em;">Extracted from</p>
          <div class="glass-card" style="padding:12px 15px;"><p style="font-size:13px; margin:0;">${escapeHtml(sourceEmail.subject)} — from ${escapeHtml(sourceEmail.from)}</p></div>
        ` : ''}
        ${sourceMemories?.length ? `
          <p style="font-size:12px; color:var(--text-secondary); margin:18px 0 8px; text-transform:uppercase; letter-spacing:0.04em;">Consolidated from ${sourceMemories.length} memories</p>
          ${sourceMemories.map((sm) => `<div class="glass-card" style="padding:10px 14px; margin-bottom:6px;"><p style="font-size:12.5px; margin:0;">${escapeHtml(sm.text)}</p></div>`).join('')}
        ` : ''}
        <div style="display:flex; gap:10px; margin-top:20px;">
          <button type="button" class="btn btn-ghost" data-action="close-modal" style="flex:1;">Close</button>
        </div>
      </div>
    `);
  } catch (err) { toast.error(err.message); closeModal(); }
}

async function runConsolidation() {
  try {
    const r = await api.post('/memory/consolidate');
    if (r.consolidation.reflectionsCreated > 0) {
      toast.success(`Consolidated ${r.consolidation.reflectionsCreated} reflection(s), archived ${r.forgetting.archivedCount}`);
    } else {
      toast.info(r.consolidation.note || 'Nothing to consolidate yet.');
    }
    loadMemory();
  } catch (err) { toast.error(err.message); }
}

/* KNOWLEDGE */
async function loadKnowledge() {
  const list = document.getElementById('knowledge-list');
  list.innerHTML = skeleton(3, 100);
  try {
    const { knowledge } = await api.get('/knowledge');
    if (!knowledge.length) { list.innerHTML = `<div class="empty-state glass-card"><p>No newsletter knowledge learned yet.</p></div>`; return; }
    list.innerHTML = knowledge.map((k) => `
      <div class="glass-card list-item">
        <p style="font-weight:600; font-size:13.5px; margin:0 0 9px;">${escapeHtml(k.subject || k.source || 'Untitled')}</p>
        ${['ideas', 'trends', 'stats', 'opportunities', 'tools'].map((field) => (k[field] || []).length ? `
          <div style="margin-bottom:7px;"><span class="badge badge-gray" style="margin-bottom:5px;">${field}</span>
            ${k[field].map((v) => `<p style="font-size:12.5px; margin:4px 0 4px 4px; color:var(--text-secondary);">${escapeHtml(v)}</p>`).join('')}
          </div>` : '').join('')}
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p class="text-secondary">Couldn't load knowledge: ${escapeHtml(err.message)}</p>`;
  }
}

/* OPPORTUNITIES */
async function loadOpportunities() {
  const list = document.getElementById('opportunities-list');
  list.innerHTML = skeleton(3, 60);
  try {
    const { opportunities } = await api.get('/opportunities');
    if (!opportunities.length) { list.innerHTML = `<div class="empty-state glass-card"><p>No opportunities surfaced yet.</p></div>`; return; }
    list.innerHTML = opportunities.map((o) => `
      <div class="glass-card list-item">
        <div class="list-row">
          <p style="font-size:13.5px; margin:0; flex:1;">${escapeHtml(o.text)}</p>
          <span class="badge badge-green">mentioned ${o.mentions}×</span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p class="text-secondary">Couldn't load opportunities: ${escapeHtml(err.message)}</p>`;
  }
}

/* ASK */
async function submitAsk() {
  const input = document.getElementById('ask-input');
  const q = input.value.trim();
  if (!q) return;
  const answerEl = document.getElementById('ask-answer');
  answerEl.innerHTML = `<div style="display:flex; align-items:center; gap:8px; color:var(--text-secondary); font-size:13px;"><span class="spinner"></span> Thinking…</div>`;
  try {
    const r = await api.post('/ask', { question: q });
    answerEl.innerHTML = `
      <div class="fade-up" style="padding-top:4px;">
        <p style="font-size:14px; line-height:1.65; margin:0 0 14px;">${escapeHtml(r.answer)}</p>
        <p style="font-size:11.5px; color:var(--text-muted); margin:0;">grounded in ${r.groundedIn.memories} memories · ${r.groundedIn.emails} emails · ${r.groundedIn.insights} insights · ${r.groundedIn.opportunities} opportunities</p>
      </div>
    `;
  } catch (err) {
    answerEl.innerHTML = `<p style="color:var(--accent-red); font-size:13.5px;">${escapeHtml(err.message)}</p>`;
  }
}

/* SETTINGS */
async function loadSettings() {
  try {
    const { settings } = await api.get('/settings');
    document.getElementById('settings-qwen-key').value = '';
    document.getElementById('settings-qwen-key').placeholder = settings.qwenApiKey || 'sk-...';
    document.getElementById('settings-qwen-baseurl').value = settings.qwenBaseUrl || '';
    document.getElementById('settings-qwen-model').value = settings.qwenModel || '';
    document.getElementById('settings-qwen-embed-model').value = settings.qwenEmbeddingModel || '';
    document.getElementById('settings-max-rounds').value = settings.negotiationMaxRounds ?? '';
    document.getElementById('settings-max-discount').value = settings.negotiationMaxDiscountPercent ?? '';
    document.getElementById('settings-approval-above').value = settings.negotiationRequireApprovalAboveAmount ?? '';
    document.getElementById('settings-min-confidence').value = settings.negotiationMinConfidenceToAutoSend ?? '';
  } catch (err) { toast.error(err.message); }

  const grid = document.getElementById('agent-status-grid');
  grid.innerHTML = skeleton(6, 74);
  try {
    const { agents } = await api.get('/agents/status');
    grid.innerHTML = agents.map((a) => `
      <div class="glass-card agent-card">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <span class="pulse-ring" style="width:6px; height:6px; border-radius:50%; background:var(--accent-green); display:inline-block; flex-shrink:0;"></span>
          <span class="agent-card-name">${escapeHtml(a.name)}</span>
        </div>
        <p style="font-size:11.5px; color:var(--text-muted); margin:0;">${a.processed} processed · ${a.failed} failed</p>
      </div>
    `).join('');
  } catch (err) { grid.innerHTML = `<p class="text-secondary">${escapeHtml(err.message)}</p>`; }

  const errList = document.getElementById('errors-list');
  errList.innerHTML = skeleton(3, 54);
  try {
    const { errors } = await api.get('/system/errors?limit=20');
    errList.innerHTML = errors.length ? errors.map((e) => `
      <div class="glass-card" style="padding:12px 16px; margin-bottom:8px;">
        <div style="display:flex; justify-content:space-between; gap:12px;">
          <span class="badge badge-gray">${escapeHtml(e.source)}</span>
          <span class="text-muted" style="font-size:11px;">${relTime(e.createdAt)}</span>
        </div>
        <p style="font-size:12.5px; margin:8px 0 0;">${escapeHtml(e.message)}</p>
      </div>
    `).join('') : `<p class="text-secondary" style="font-size:13px;">No errors recorded — clean run.</p>`;
  } catch (err) { errList.innerHTML = `<p class="text-secondary">${escapeHtml(err.message)}</p>`; }

  const blocksList = document.getElementById('login-blocks-list');
  try {
    const { blocks } = await api.get('/system/login-blocks');
    blocksList.innerHTML = blocks.length ? blocks.map((b) => `
      <div class="glass-card list-item">
        <div class="list-row">
          <div>
            <p style="font-size:13px; margin:0 0 3px;" class="mono">${escapeHtml(b.fingerprint)}</p>
            <p style="font-size:12px; color:var(--text-secondary); margin:0;">${escapeHtml(b.reason)} · attempted user "${escapeHtml(b.lastUsername || '?')}" · ${relTime(b.blockedAt)}</p>
          </div>
          <button class="btn btn-secondary btn-sm" data-action="unblock-login" data-id="${b.fingerprint}">Unblock</button>
        </div>
      </div>
    `).join('') : `<p class="text-secondary" style="font-size:13px;">No blocked devices. (3 failed logins from the same IP+browser triggers a block — editable at <span class="mono">data/login-blocks.json</span>.)</p>`;
  } catch (err) { blocksList.innerHTML = `<p class="text-secondary">${escapeHtml(err.message)}</p>`; }
}

async function unblockLogin(fingerprint) {
  try { await api.del(`/system/login-blocks/${fingerprint}`); toast.success('Unblocked'); loadSettings(); }
  catch (err) { toast.error(err.message); }
}

async function saveSettings() {
  const patch = {
    qwenBaseUrl: document.getElementById('settings-qwen-baseurl').value.trim(),
    qwenModel: document.getElementById('settings-qwen-model').value.trim(),
    qwenEmbeddingModel: document.getElementById('settings-qwen-embed-model').value.trim(),
    negotiationMaxRounds: Number(document.getElementById('settings-max-rounds').value) || undefined,
    negotiationMaxDiscountPercent: Number(document.getElementById('settings-max-discount').value) || undefined,
    negotiationRequireApprovalAboveAmount: document.getElementById('settings-approval-above').value ? Number(document.getElementById('settings-approval-above').value) : null,
    negotiationMinConfidenceToAutoSend: Number(document.getElementById('settings-min-confidence').value) || undefined,
  };
  const newKey = document.getElementById('settings-qwen-key').value.trim();
  if (newKey) patch.qwenApiKey = newKey;

  try {
    await api.patch('/settings', patch);
    toast.success('Settings saved — takes effect immediately');
    loadSettings();
  } catch (err) { toast.error(err.message); }
}

boot();
