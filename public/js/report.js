var EquianoReport = (function() {
  var OFFLINE_KEY = 'equiano-offline-reports';

  function getCurrentPosition() {
    return new Promise(function(resolve) {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        function(pos) {
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        function() {
          resolve(null);
        },
        { timeout: 8000, maximumAge: 60000 }
      );
    });
  }

  function submitReport(formData) {
    return fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(function(res) {
      return res.json();
    });
  }

  function queueOfflineReport(formData) {
    try {
      var queue = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]');
      formData.queuedAt = new Date().toISOString();
      queue.push(formData);
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(queue));
    } catch (e) {
      // Storage unavailable
    }
  }

  function flushOfflineReports() {
    if (!navigator.onLine) return;
    try {
      var queue = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]');
      if (!queue.length) return;

      var remaining = [];
      var promises = queue.map(function(report) {
        return submitReport(report).then(function(res) {
          if (!res.ok) remaining.push(report);
        }).catch(function() {
          remaining.push(report);
        });
      });

      Promise.all(promises).then(function() {
        if (remaining.length) {
          localStorage.setItem(OFFLINE_KEY, JSON.stringify(remaining));
        } else {
          localStorage.removeItem(OFFLINE_KEY);
        }
      });
    } catch (e) {
      // Storage unavailable
    }
  }

  // Flush on load
  flushOfflineReports();

  return {
    getCurrentPosition: getCurrentPosition,
    submitReport: submitReport,
    queueOfflineReport: queueOfflineReport,
    flushOfflineReports: flushOfflineReports
  };
})();
