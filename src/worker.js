// Pocket Option API Proxy Worker
export default {
  async fetch(request, env) {
    // CORS headers for browser requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS request (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      const apiUrl = 'https://api.pocketoption.com' + url.pathname + url.search;
      
      // Forward the request to Pocket Option API
      const modifiedRequest = new Request(apiUrl, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Cloudflare Worker',
        },
        body: request.body
      });

      const response = await fetch(modifiedRequest);
      const responseText = await response.text();

      // Return response with CORS headers
      return new Response(responseText, {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      });
    }
  }
};
