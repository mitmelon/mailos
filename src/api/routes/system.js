const https = require('https');
const { version } = require('../../../package.json');
const errorLog = require('../../services/ErrorLogService');
const loginGuard = require('../../services/LoginGuard');

const GITHUB_REPO = process.env.GITHUB_REPO || null; // e.g. "yourname/mailos" - set this to enable update checks

module.exports = async function systemRoutes(app) {
  app.get('/system/version', async () => ({ version, githubRepo: GITHUB_REPO }));

  // GET /system/update-check - compares against the latest GitHub release, if GITHUB_REPO is configured.
  app.get('/system/update-check', async (req, reply) => {
    if (!GITHUB_REPO) return reply.send({ configured: false, message: 'Set GITHUB_REPO in .env to enable update checks.' });
    try {
      const latest = await fetchLatestRelease(GITHUB_REPO);
      const latestVersion = (latest.tag_name || '').replace(/^v/, '');
      return reply.send({
        configured: true,
        currentVersion: version,
        latestVersion: latestVersion || null,
        updateAvailable: latestVersion ? isNewer(latestVersion, version) : false,
        releaseUrl: latest.html_url || null,
        releaseNotes: latest.body || null,
      });
    } catch (err) {
      return reply.send({ configured: true, error: err.message, updateAvailable: false });
    }
  });

  // GET /system/errors - the audit log requested for debugging.
  app.get('/system/errors', async (req) => {
    const limit = req.query?.limit ? parseInt(req.query.limit, 10) : 50;
    return { errors: await errorLog.recent(limit) };
  });

  // GET /system/login-blocks and DELETE /system/login-blocks/:fingerprint - admin-facing
  // alternative to hand-editing data/login-blocks.json directly.
  app.get('/system/login-blocks', async () => ({ blocks: loginGuard.listBlocks() }));
  app.delete('/system/login-blocks/:fingerprint', async (req, reply) => {
    loginGuard.unblock(req.params.fingerprint);
    return reply.send({ unblocked: req.params.fingerprint });
  });

  // POST /system/update - pulls the latest code and reinstalls dependencies,
  // then exits so a process supervisor (pm2, systemd) restarts it. The data/
  // directory (all mailboxes, memory, negotiations) is untouched - it lives
  // outside the git-tracked source tree. Requires the deployment to (a) be a
  // git checkout and (b) run under a supervisor configured to auto-restart -
  // documented in the README, not assumed silently.
  app.post('/system/update', async (req, reply) => {
    const { execSync } = require('child_process');
    try {
      execSync('git pull', { cwd: process.cwd(), stdio: 'pipe' });
      execSync('npm install --omit=dev', { cwd: process.cwd(), stdio: 'pipe' });
    } catch (err) {
      return reply.status(500).send({ error: `Update failed: ${err.message}. No restart triggered - current version is still running.` });
    }
    reply.send({ updated: true, message: 'Restarting now - your process supervisor must be configured to auto-restart.' });
    setTimeout(() => process.exit(0), 500);
  });
};

function fetchLatestRelease(repo) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      `https://api.github.com/repos/${repo}/releases/latest`,
      { headers: { 'User-Agent': 'MailOS-UpdateChecker' }, timeout: 8000 },
      (res) => {
        let body = '';
        res.on('data', (c) => { body += c; });
        res.on('end', () => {
          if (res.statusCode !== 200) return reject(new Error(`GitHub API returned ${res.statusCode}`));
          try { resolve(JSON.parse(body)); } catch (err) { reject(err); }
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('GitHub API request timed out')));
  });
}

function isNewer(latest, current) {
  const a = latest.split('.').map(Number);
  const b = current.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] || 0) > (b[i] || 0)) return true;
    if ((a[i] || 0) < (b[i] || 0)) return false;
  }
  return false;
}
