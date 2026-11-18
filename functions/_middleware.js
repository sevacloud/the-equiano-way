// STAGE       — "production" shows the hero-only Coming Soon landing page.
// MAP_ENABLED — anything other than "true" makes /map serve a Coming Soon
//               page instead of the map. Links to the map are left as-is.

var MAP_PATHS = ['/map', '/map.html', '/map/'];

export async function onRequest(context) {
  var url = new URL(context.request.url);

  if (context.env.MAP_ENABLED !== 'true' && MAP_PATHS.includes(url.pathname)) {
    var soon = await context.env.ASSETS.fetch(new URL('/map-coming-soon', url));
    return new Response(soon.body, {
      status: 200,
      headers: soon.headers
    });
  }

  var response = await context.next();

  if (url.pathname === '/' || url.pathname === '/index.html') {
    var stage = context.env.STAGE || 'production';
    if (stage === 'production') {
      var html = await response.text();
      html = html.replace('<body>', '<body class="prod">');
      return new Response(html, {
        status: response.status,
        headers: response.headers
      });
    }
  }

  return response;
}
