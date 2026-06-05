var ADMIN_EMAIL = 'admin@equianoway.co.uk';
var FROM_EMAIL = 'reports@equianoway.co.uk';
var CORS_ORIGIN = 'https://equianoway.co.uk';
var RATE_LIMIT = 10;
var RATE_LIMIT_TTL = 3600;

function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

function corsHeaders(origin) {
  var allowed = [CORS_ORIGIN, 'http://127.0.0.1:8788', 'http://localhost:8788'];
  var isAllowed = allowed.indexOf(origin) !== -1 ||
    /^https:\/\/.*\.equiano-way\.pages\.dev$/.test(origin);
  var allowedOrigin = isAllowed ? origin : CORS_ORIGIN;
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
}

export async function onRequest(context) {
  var request = context.request;
  var env = context.env;
  var origin = request.headers.get('Origin') || '';

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders(origin)
    });
  }

  var ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  var rlKey = 'rl:' + ip;

  try {
    var countStr = await env.REPORT_FALLBACK.get(rlKey);
    var count = countStr ? parseInt(countStr, 10) : 0;

    if (count >= RATE_LIMIT) {
      return new Response(JSON.stringify({ error: 'Too many submissions. Please try again later.' }), {
        status: 429,
        headers: corsHeaders(origin)
      });
    }

    await env.REPORT_FALLBACK.put(rlKey, String(count + 1), { expirationTtl: RATE_LIMIT_TTL });
  } catch (e) {
    // If KV fails, allow the request through
  }

  var body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: corsHeaders(origin)
    });
  }

  if (!body.type || !body.description) {
    return new Response(JSON.stringify({ error: 'Missing required fields: type and description' }), {
      status: 400,
      headers: corsHeaders(origin)
    });
  }

  var sanitised = {};
  for (var key in body) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      if (typeof body[key] === 'string') {
        sanitised[key] = stripHtml(body[key]);
      } else if (Array.isArray(body[key])) {
        sanitised[key] = body[key].map(function(v) {
          return typeof v === 'string' ? stripHtml(v) : v;
        });
      } else {
        sanitised[key] = body[key];
      }
    }
  }

  var subject = '[Equiano Way] ' + sanitised.type;
  if (sanitised.category) subject += ' — ' + sanitised.category;
  else if (sanitised.section) subject += ' — ' + sanitised.section;

  var locationLink = '';
  if (sanitised.lat && sanitised.lng) {
    locationLink = '<tr><td style="padding:6px 12px;font-weight:bold;vertical-align:top">Location</td>' +
      '<td style="padding:6px 12px"><a href="https://www.google.com/maps?q=' +
      sanitised.lat + ',' + sanitised.lng + '">View on Google Maps</a> (' +
      sanitised.lat + ', ' + sanitised.lng + ')</td></tr>';
  }

  var rows = '';
  for (var field in sanitised) {
    if (Object.prototype.hasOwnProperty.call(sanitised, field)) {
      if (field === 'lat' || field === 'lng') continue;
      var value = sanitised[field];
      if (Array.isArray(value)) value = value.join(', ');
      rows += '<tr><td style="padding:6px 12px;font-weight:bold;vertical-align:top;white-space:nowrap">' +
        stripHtml(field) + '</td><td style="padding:6px 12px">' + stripHtml(String(value)) + '</td></tr>';
    }
  }

  var htmlBody = '<div style="font-family:sans-serif;max-width:600px">' +
    '<h2 style="color:#1A6B5F;margin-bottom:16px">' + stripHtml(subject) + '</h2>' +
    '<table style="border-collapse:collapse;width:100%;border:1px solid #E8E0D0">' +
    '<tbody>' + rows + locationLink + '</tbody></table>' +
    '<p style="margin-top:16px;color:#7A7060;font-size:13px">Submitted at ' +
    new Date().toISOString() + ' from IP ' + stripHtml(ip) + '</p></div>';

  var resendPayload = {
    from: FROM_EMAIL,
    to: [ADMIN_EMAIL],
    subject: subject,
    html: htmlBody
  };

  try {
    var resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resendPayload)
    });

    if (!resendRes.ok) {
      var fallbackKey = 'fallback:' + Date.now();
      await env.REPORT_FALLBACK.put(fallbackKey, JSON.stringify(sanitised), {
        expirationTtl: 604800
      });
      return new Response(JSON.stringify({ ok: true, queued: true }), {
        status: 200,
        headers: corsHeaders(origin)
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders(origin)
    });
  } catch (e) {
    var fallbackKey2 = 'fallback:' + Date.now();
    try {
      await env.REPORT_FALLBACK.put(fallbackKey2, JSON.stringify(sanitised), {
        expirationTtl: 604800
      });
    } catch (kvErr) {
      // KV also failed — still don't show error to walker
    }
    return new Response(JSON.stringify({ ok: true, queued: true }), {
      status: 200,
      headers: corsHeaders(origin)
    });
  }
}
