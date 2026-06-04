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

var heritageWaypoints = [
  { latlng: [53.4245, -1.3840], label: 'Wincobank Hall area', emoji: '✦' },
  { latlng: [53.4170, -1.3590], label: 'River Rother crossing', emoji: '≋' },
  { latlng: [53.4130, -1.3250], label: 'Sheffield Country Walk junction', emoji: '✦' }
];

heritageWaypoints.forEach(function(wp) {
  L.marker(wp.latlng, { icon: makeMarker(wp.emoji, 'heritage'), alt: wp.label })
    .addTo(equianoMap)
    .bindPopup('<b style="font-family:\'Cinzel\',serif;font-size:0.8rem;letter-spacing:0.1em">' + wp.label + '</b>');
});

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

setTimeout(function() {
  document.getElementById('mapLoading').classList.add('hidden');
  setTimeout(function() {
    document.getElementById('waypointAlert').classList.add('visible');
  }, 1200);
}, 1400);
