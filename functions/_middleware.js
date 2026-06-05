export async function onRequest(context) {
  var response = await context.next();
  var url = new URL(context.request.url);

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
