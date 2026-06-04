var drawer = document.getElementById('drawer');
var drawerHandle = document.getElementById('drawerHandle');
var drawerOpen = false;

function setDrawerOpen(open) {
  drawerOpen = open;
  drawer.style.transition = 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)';
  drawer.style.transform  = '';
  drawer.classList.toggle('open', drawerOpen);
  drawerHandle.setAttribute('aria-expanded', drawerOpen);
  document.getElementById('map').style.bottom = drawerOpen ? '60%' : 'var(--drawer-peek)';
  document.querySelector('.btn-locate').style.bottom = drawerOpen
    ? 'calc(60% + 1rem)'
    : 'calc(var(--drawer-peek) + 1rem)';
}

function toggleDrawer() { setDrawerOpen(!drawerOpen); }

drawerHandle.addEventListener('click', toggleDrawer);
drawerHandle.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDrawer(); }
});

var SWIPE_THRESHOLD = 60;
var SWIPE_VELOCITY  = 0.4;

var touchStartY    = 0;
var touchStartX    = 0;
var touchStartTime = 0;
var dragging       = false;
var dragDeltaY     = 0;
var isHorizSwipe   = null;

function getClosedOffset() {
  return drawer.offsetHeight - parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue('--drawer-peek') || '120', 10
  );
}

drawer.addEventListener('touchstart', function(e) {
  var drawerContent = document.getElementById('drawerContent');
  if (drawerOpen && drawerContent.contains(e.target) && drawerContent.scrollTop > 0) return;

  touchStartY    = e.touches[0].clientY;
  touchStartX    = e.touches[0].clientX;
  touchStartTime = Date.now();
  dragging       = false;
  dragDeltaY     = 0;
  isHorizSwipe   = null;

  drawer.style.transition = 'none';
}, { passive: true });

drawer.addEventListener('touchmove', function(e) {
  var dy = e.touches[0].clientY - touchStartY;
  var dx = e.touches[0].clientX - touchStartX;

  if (isHorizSwipe === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
    isHorizSwipe = Math.abs(dx) > Math.abs(dy);
  }

  if (isHorizSwipe) return;

  dragging   = true;
  dragDeltaY = dy;

  var base = drawerOpen ? 0 : getClosedOffset();
  var translate = base + dy;

  var closedOffset = getClosedOffset();
  translate = Math.max(0, Math.min(translate, closedOffset));

  drawer.style.transform = 'translateY(' + translate + 'px)';
}, { passive: true });

drawer.addEventListener('touchend', function(e) {
  if (!dragging || isHorizSwipe) {
    drawer.style.transition = '';
    return;
  }

  var elapsed  = Date.now() - touchStartTime;
  var velocity = Math.abs(dragDeltaY) / elapsed;
  var isFastSwipe = velocity > SWIPE_VELOCITY;

  if (!drawerOpen) {
    var shouldOpen = dragDeltaY < -SWIPE_THRESHOLD || (isFastSwipe && dragDeltaY < 0);
    setDrawerOpen(shouldOpen);
  } else {
    var shouldClose = dragDeltaY > SWIPE_THRESHOLD || (isFastSwipe && dragDeltaY > 0);
    setDrawerOpen(!shouldClose);
  }

  dragging = false;
}, { passive: true });
