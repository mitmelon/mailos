const api = (() => {
  async function request(method, path, body) {
    const opts = {
      method,
      credentials: 'include',
      headers: {},
    };
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(path, opts);
    // Only redirect to login on 401 if we're on a protected page (like app.html)
    // Don't redirect if we're already on login.html or if this is an auth check
    if (res.status === 401 && path !== '/auth/login' && path !== '/auth/register') {
      // Check if we're already on login page or if this is just an auth status check
      const currentPath = window.location.pathname;
      if (currentPath !== '/login.html' && currentPath !== '/' && !currentPath.startsWith('/auth/')) {
        window.location.href = '/login.html';
        return new Promise(() => {}); // never resolves — we're navigating away
      }
    }
    let data = null;
    try { data = await res.json(); } catch { /* no body */ }
    if (!res.ok) {
      const err = new Error(data?.error || `Request failed (${res.status})`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body ?? {}),
    patch: (path, body) => request('PATCH', path, body ?? {}),
    del: (path) => request('DELETE', path),
  };
})();
