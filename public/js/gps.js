var btnLocate = document.getElementById('btnLocate');
var locating = false;

btnLocate.addEventListener('click', function() {
  if (!navigator.geolocation) {
    alert('Location is not available in this browser.');
    return;
  }

  locating = !locating;
  btnLocate.classList.toggle('active', locating);
  btnLocate.setAttribute('aria-pressed', locating);
  btnLocate.setAttribute('aria-label', locating ? 'Stop tracking my location' : 'Show my location on the map');

  if (locating) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      var latitude = pos.coords.latitude;
      var longitude = pos.coords.longitude;
      window.gpsMarker.setLatLng([latitude, longitude]);
      window.equianoMap.setView([latitude, longitude], 15, { animate: true });
    }, function() {
      locating = false;
      btnLocate.classList.remove('active');
    });
  }
});
