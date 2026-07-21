
  window.__RUNTIME_ERRORS__ = [];
  window.onerror = function (msg, url, line) {
    window.__RUNTIME_ERRORS__.push(msg + ' @ ' + url + ':' + line);
    var el = document.getElementById('runtime-errors');
    if (!el) return;
    el.textContent = 'RUNTIME ERRORS:\n' + window.__RUNTIME_ERRORS__.slice(0, 5).join('\n');
    el.style.display = 'block';
    el.style.background = '#7f1d1d';
    el.style.color = '#fecaca';
    el.style.padding = '10px 14px';
    el.style.margin = '10px 0';
    el.style.borderRadius = '8px';
    el.style.fontFamily = 'ui-monospace, monospace';
    el.style.fontSize = '12px';
    el.style.whiteSpace = 'pre-wrap';
  };
  window.addEventListener('unhandledrejection', function (e) {
    var msg = (e && e.reason && e.reason.message) || String(e.reason);
    window.onerror(msg, 'unhandledrejection', 0);
  });
