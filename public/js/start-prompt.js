(function() {
  if (EquianoSession.isSessionFromToday()) return;

  var overlay = document.createElement('div');
  overlay.id = 'startPromptOverlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'startPromptHeading');
  overlay.innerHTML = '<div class="sp-inner">' +
    '<h2 class="sp-heading" id="startPromptHeading">Where are you starting today?</h2>' +
    '<p class="sp-sub">Choose your section or let GPS find you</p>' +
    '<button class="sp-locate-btn" id="spLocateBtn" aria-label="Use my current location to find the nearest section">' +
      '<svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true">' +
        '<circle cx="11" cy="11" r="3.5" stroke="currentColor" stroke-width="1.5"/>' +
        '<path d="M11 2v3M11 17v3M2 11h3M17 11h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
      '</svg>' +
      'Use my current location' +
    '</button>' +
    '<div class="sp-divider"><span>or choose a section</span></div>' +
    '<div class="sp-sections" id="spSections" role="list"></div>' +
  '</div>';

  var style = document.createElement('style');
  style.textContent =
    '#startPromptOverlay {' +
      'position: fixed; inset: 0; z-index: 9000;' +
      'background: rgba(15,39,35,0.97);' +
      'display: flex; align-items: flex-start; justify-content: center;' +
      'overflow-y: auto; -webkit-overflow-scrolling: touch;' +
      'padding: 2rem 1rem;' +
    '}' +
    '.sp-inner {' +
      'width: 100%; max-width: 480px; padding: 2rem 0;' +
    '}' +
    '.sp-heading {' +
      'font-family: var(--font-display); font-size: clamp(1.4rem, 4vw, 2rem);' +
      'font-weight: 400; color: #F2EDE3; text-align: center;' +
      'letter-spacing: 0.05em; margin-bottom: 0.5rem;' +
    '}' +
    '.sp-sub {' +
      'font-family: var(--font-body); font-size: 1rem; font-style: italic;' +
      'font-weight: 300; color: #A89F90; text-align: center;' +
      'margin-bottom: 2rem;' +
    '}' +
    '.sp-locate-btn {' +
      'display: flex; align-items: center; justify-content: center;' +
      'gap: 0.75rem; width: 100%; min-height: 52px;' +
      'background: rgba(196,154,46,0.15); border: 1px solid rgba(196,154,46,0.4);' +
      'color: #C49A2E; font-family: var(--font-reading);' +
      'font-size: 0.85rem; letter-spacing: 0.12em; text-transform: uppercase;' +
      'cursor: pointer; transition: background 0.2s; border-radius: 2px; padding: 0 1rem;' +
    '}' +
    '.sp-locate-btn:hover { background: rgba(196,154,46,0.25); }' +
    '.sp-locate-btn:focus-visible { outline: 2px solid #C49A2E; outline-offset: 3px; }' +
    '.sp-locate-btn.loading { opacity: 0.6; pointer-events: none; }' +
    '.sp-divider {' +
      'display: flex; align-items: center; gap: 1rem;' +
      'margin: 1.75rem 0; color: #7A7060;' +
    '}' +
    '.sp-divider::before, .sp-divider::after {' +
      'content: ""; flex: 1; height: 1px;' +
      'background: rgba(242,237,227,0.1);' +
    '}' +
    '.sp-divider span {' +
      'font-family: var(--font-reading); font-size: 0.7rem;' +
      'letter-spacing: 0.2em; text-transform: uppercase;' +
    '}' +
    '.sp-sections { display: flex; flex-direction: column; gap: 0.5rem; }' +
    '.sp-card {' +
      'display: flex; align-items: center; justify-content: space-between;' +
      'min-height: 56px; padding: 0.875rem 1.1rem;' +
      'background: rgba(242,237,227,0.05); border: 1px solid rgba(242,237,227,0.1);' +
      'cursor: pointer; transition: background 0.2s, border-color 0.2s;' +
      'border-radius: 2px; text-align: left; width: 100%;' +
      'font-family: inherit; color: inherit;' +
    '}' +
    '.sp-card:hover { background: rgba(26,107,95,0.2); border-color: rgba(196,154,46,0.4); }' +
    '.sp-card:focus-visible { outline: 2px solid #C49A2E; outline-offset: 2px; }' +
    '.sp-card-left { display: flex; flex-direction: column; gap: 0.15rem; }' +
    '.sp-card-day {' +
      'font-family: var(--font-reading); font-size: 0.6rem;' +
      'letter-spacing: 0.3em; text-transform: uppercase; color: #C49A2E;' +
    '}' +
    '.sp-card-name {' +
      'font-family: var(--font-body); font-size: 1rem;' +
      'font-weight: 400; color: #F2EDE3; line-height: 1.3;' +
    '}' +
    '.sp-card-miles {' +
      'font-family: var(--font-reading); font-size: 0.7rem;' +
      'letter-spacing: 0.15em; color: #A89F90; white-space: nowrap;' +
    '}' +
    '.sp-fallback {' +
      'text-align: center; padding: 3rem 1rem;' +
    '}' +
    '.sp-fallback p {' +
      'font-family: var(--font-body); font-size: 1.1rem;' +
      'font-style: italic; color: #A89F90; margin-bottom: 1.5rem;' +
    '}' +
    '.sp-dismiss-btn {' +
      'display: inline-flex; align-items: center; gap: 0.5rem;' +
      'min-height: 44px; padding: 0.75rem 2rem;' +
      'font-family: var(--font-display); font-size: 0.7rem;' +
      'letter-spacing: 0.25em; text-transform: uppercase;' +
      'color: #1C1813; background: #C49A2E; border: none; cursor: pointer;' +
      'transition: background 0.2s;' +
    '}' +
    '.sp-dismiss-btn:hover { background: #F5E6C0; }' +
    '.sp-dismiss-btn:focus-visible { outline: 3px solid #F5E6C0; outline-offset: 3px; }';

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  var sectionsContainer = document.getElementById('spSections');
  var locateBtn = document.getElementById('spLocateBtn');

  function dismiss() {
    overlay.remove();
    style.remove();
  }

  function selectSection(section) {
    var today = new Date().toISOString().split('T')[0];
    EquianoSession.saveSession({
      startSectionSlug: section.slug,
      startLat: section.startLat,
      startLng: section.startLng,
      visitedWaypoints: [],
      sessionDate: today
    });
    dismiss();
    if (typeof map !== 'undefined' && map.setView) {
      map.setView([section.startLat, section.startLng], 14, { animate: true });
    }
  }

  function showFallback() {
    overlay.querySelector('.sp-inner').innerHTML =
      '<div class="sp-fallback">' +
        '<h2 class="sp-heading" id="startPromptHeading">Where are you starting today?</h2>' +
        '<p>Tap your start point on the map</p>' +
        '<button class="sp-dismiss-btn" aria-label="Dismiss and use the map">Continue to Map</button>' +
      '</div>';
    overlay.querySelector('.sp-dismiss-btn').addEventListener('click', dismiss);
  }

  function findNearestSection(lat, lng, sections) {
    var nearest = null;
    var minDist = Infinity;
    for (var i = 0; i < sections.length; i++) {
      var dlat = sections[i].startLat - lat;
      var dlng = sections[i].startLng - lng;
      var dist = dlat * dlat + dlng * dlng;
      if (dist < minDist) {
        minDist = dist;
        nearest = sections[i];
      }
    }
    return nearest;
  }

  function renderSections(sections) {
    for (var i = 0; i < sections.length; i++) {
      (function(section) {
        var btn = document.createElement('button');
        btn.className = 'sp-card';
        btn.setAttribute('role', 'listitem');
        btn.setAttribute('aria-label', section.day + ', ' + section.name + ', ' + section.miles + ' miles');
        btn.innerHTML =
          '<div class="sp-card-left">' +
            '<span class="sp-card-day">' + section.day + '</span>' +
            '<span class="sp-card-name">' + section.name + '</span>' +
          '</div>' +
          '<span class="sp-card-miles">' + section.miles + ' mi</span>';
        btn.addEventListener('click', function() { selectSection(section); });
        sectionsContainer.appendChild(btn);
      })(sections[i]);
    }
  }

  fetch('/data/sections.json')
    .then(function(res) {
      if (!res.ok) throw new Error('Failed to load');
      return res.json();
    })
    .then(function(sections) {
      if (!sections || !sections.length) {
        showFallback();
        return;
      }

      renderSections(sections);

      locateBtn.addEventListener('click', function() {
        if (!navigator.geolocation) {
          selectSection(sections[0]);
          return;
        }
        locateBtn.classList.add('loading');
        locateBtn.textContent = 'Finding your location…';
        navigator.geolocation.getCurrentPosition(
          function(pos) {
            var nearest = findNearestSection(pos.coords.latitude, pos.coords.longitude, sections);
            selectSection(nearest);
          },
          function() {
            locateBtn.classList.remove('loading');
            locateBtn.textContent = 'Location unavailable — choose below';
          },
          { timeout: 10000, maximumAge: 60000 }
        );
      });
    })
    .catch(function() {
      showFallback();
    });
})();
