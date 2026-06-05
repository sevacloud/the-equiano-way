var equianoMap = L.map('map', {
  center: [53.42, -1.38],
  zoom: 13,
  zoomControl: true,
  attributionControl: true,
  zoomAnimation: true
});

equianoMap.zoomControl.setPosition('bottomright');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
  className: 'map-tiles'
}).addTo(equianoMap);

var routeCoords = [
  [53.4285, -1.3920],
  [53.4260, -1.3880],
  [53.4240, -1.3830],
  [53.4220, -1.3770],
  [53.4200, -1.3690],
  [53.4180, -1.3620],
  [53.4160, -1.3540],
  [53.4145, -1.3460],
  [53.4130, -1.3370],
  [53.4120, -1.3280],
  [53.4115, -1.3190],
  [53.4125, -1.3100],
  [53.4140, -1.3010]
];

var completedCoords = routeCoords.slice(0, 4);
var remainingCoords = routeCoords.slice(3);

L.polyline(completedCoords, {
  color: '#C49A2E',
  weight: 4,
  opacity: 0.9,
  lineCap: 'round',
  lineJoin: 'round'
}).addTo(equianoMap);

L.polyline(remainingCoords, {
  color: '#1A6B5F',
  weight: 4,
  opacity: 0.7,
  lineCap: 'round',
  lineJoin: 'round',
  dashArray: null
}).addTo(equianoMap);

function makeMarker(emoji, type) {
  return L.divIcon({
    className: '',
    html: '<div class="waypoint-marker ' + type + '" role="img" aria-label="' + type + ' waypoint">' +
             '<div class="waypoint-marker-inner">' + emoji + '</div>' +
           '</div>',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36]
  });
}

L.marker([53.4285, -1.3920], { icon: makeMarker('⚑', 'start'), alt: 'Start: Wincobank Chapel' })
  .addTo(equianoMap)
  .bindPopup('<b style="font-family:\'Cinzel\',serif;font-size:0.8rem;letter-spacing:0.1em">Wincobank Chapel</b><br><span style="font-family:\'Crimson Pro\',serif;font-size:0.85rem;color:#7A7060">Day 1 start</span>');

L.marker([53.4140, -1.3010], { icon: makeMarker('◉', 'end'), alt: 'End: Whiston' })
  .addTo(equianoMap)
  .bindPopup('<b style="font-family:\'Cinzel\',serif;font-size:0.8rem;letter-spacing:0.1em">Whiston</b><br><span style="font-family:\'Crimson Pro\',serif;font-size:0.85rem;color:#7A7060">Day 1 end · 7.4 miles</span>');

var gpsDotIcon = L.divIcon({
  className: '',
  html: '<div class="gps-dot-outer" aria-label="Your current position"><div class="gps-dot-inner"></div></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

var gpsMarker = L.marker([53.4246, -1.3842], {
  icon: gpsDotIcon,
  zIndexOffset: 1000,
  alt: 'Your current position'
}).addTo(equianoMap);

window.equianoMap = equianoMap;
window.gpsMarker = gpsMarker;

function haversineDistance(lat1, lng1, lat2, lng2) {
  var R = 6371000;
  var toRad = Math.PI / 180;
  var dLat = (lat2 - lat1) * toRad;
  var dLng = (lng2 - lng1) * toRad;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

window.equianoWaypoints = [];
var nearestAlertWaypoint = null;

function checkWaypointProximity(lat, lng) {
  var alertEl = document.getElementById('waypointAlert');
  var alertText = document.getElementById('waypointAlertText');
  var closest = null;
  var closestDist = Infinity;

  for (var i = 0; i < window.equianoWaypoints.length; i++) {
    var wp = window.equianoWaypoints[i];
    var dist = haversineDistance(lat, lng, wp.lat, wp.lng);
    if (dist < wp.triggerRadiusM && dist < closestDist) {
      closest = wp;
      closestDist = dist;
    }
  }

  if (closest) {
    nearestAlertWaypoint = closest;
    alertText.textContent = closest.title + ' nearby';
    alertEl.classList.add('visible');
  } else {
    nearestAlertWaypoint = null;
    alertEl.classList.remove('visible');
  }
}

window.checkWaypointProximity = checkWaypointProximity;
window.getNearestAlertWaypoint = function() { return nearestAlertWaypoint; };

function loadWaypoints() {
  fetch('/data/waypoints.json')
    .then(function(res) {
      if (!res.ok) throw new Error('Failed to load waypoints');
      return res.json();
    })
    .then(function(waypoints) {
      if (!waypoints || !waypoints.length) return;

      window.equianoWaypoints = waypoints;

      for (var i = 0; i < waypoints.length; i++) {
        (function(wp) {
          var markerType = wp.type === 'heritage' ? 'heritage' : 'practical';
          var marker = L.marker([wp.lat, wp.lng], {
            icon: makeMarker(wp.icon, markerType),
            alt: wp.title
          }).addTo(equianoMap);

          marker.bindPopup(
            '<b style="font-family:\'Cinzel\',serif;font-size:0.8rem;letter-spacing:0.1em">' + wp.title + '</b>' +
            '<br><span style="font-family:\'Crimson Pro\',serif;font-size:0.85rem;color:#7A7060">' + wp.subtitle + '</span>'
          );

          marker.on('click', function() {
            if (typeof openStory === 'function') {
              openStory(wp.slug);
            }
          });
        })(waypoints[i]);
      }

      var gpsPos = gpsMarker.getLatLng();
      checkWaypointProximity(gpsPos.lat, gpsPos.lng);
    })
    .catch(function() {
      // Waypoints unavailable — map still works without them
    });
}

loadWaypoints();

setTimeout(function() {
  document.getElementById('mapLoading').classList.add('hidden');
}, 1400);
