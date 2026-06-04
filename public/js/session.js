var EquianoSession = (function() {
  var STORAGE_KEY = 'equiano-session';

  function loadSession() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function saveSession(state) {
    try {
      state.savedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Storage full or unavailable
    }
  }

  function clearSession() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Storage unavailable
    }
  }

  function isSessionFromToday() {
    var session = loadSession();
    if (!session || !session.sessionDate) return false;
    var today = new Date().toISOString().split('T')[0];
    return session.sessionDate === today;
  }

  return {
    loadSession: loadSession,
    saveSession: saveSession,
    clearSession: clearSession,
    isSessionFromToday: isSessionFromToday
  };
})();
