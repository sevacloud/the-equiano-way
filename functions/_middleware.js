// STAGE       — "production" shows the hero-only Coming Soon landing page.
// MAP_ENABLED — anything other than "true" hides the map: /map serves a
//               Coming Soon page and every link to map.html is replaced.

var MAP_PATHS = ['/map', '/map.html', '/map/'];

var MAP_SOON_CSS =
  '<style>' +
  '.map-soon{cursor:default;pointer-events:none;opacity:.8}' +
  '.map-soon::before{display:none}' +
  '</style>';

// Links that take the user "back" to the map are pointed home instead.
var BACK_LINK_CLASSES = ['btn-back', 'btn-map'];

function hasClass(el, names) {
  var cls = (el.getAttribute('class') || '').split(/\s+/);
  return names.some(function (n) { return cls.indexOf(n) !== -1; });
}

class MapLinkHandler {
  element(el) {
    if (hasClass(el, BACK_LINK_CLASSES)) {
      el.setAttribute('href', 'index.html');
      el.setAttribute('aria-label', 'Back to home');
      if (hasClass(el, ['btn-map'])) {
        el.setInnerContent('Back to Home');
      }
      return;
    }
    // Turn the link into plain, non-interactive text.
    el.tagName = 'span';
    el.removeAttribute('href');
    el.removeAttribute('id');
    el.removeAttribute('aria-label');
    el.setAttribute('class', ((el.getAttribute('class') || '') + ' map-soon').trim());
    el.setInnerContent('Map — Coming Soon');
  }
}

export async function onRequest(context) {
  var url = new URL(context.request.url);
  var mapEnabled = context.env.MAP_ENABLED === 'true';

  if (!mapEnabled && MAP_PATHS.indexOf(url.pathname) !== -1) {
    var soon = await context.env.ASSETS.fetch(new URL('/map-coming-soon', url));
    return new Response(soon.body, {
      status: 200,
      headers: soon.headers
    });
  }

  var response = await context.next();
  var type = response.headers.get('content-type') || '';
  if (type.indexOf('text/html') === -1) return response;

  var rewriter = new HTMLRewriter();

  if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/index') {
    var stage = context.env.STAGE || 'production';
    if (stage === 'production') {
      rewriter.on('body', {
        element(el) { el.setAttribute('class', 'prod'); }
      });
    }
  }

  if (!mapEnabled) {
    rewriter
      .on('head', {
        element(el) { el.append(MAP_SOON_CSS, { html: true }); }
      })
      .on('a[href="map.html"], a[href="/map.html"], a[href="/map"]', new MapLinkHandler());
  }

  return rewriter.transform(response);
}
