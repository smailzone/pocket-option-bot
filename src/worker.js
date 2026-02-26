// Pocket Option API Proxy Worker
export default {
  async fetch(request, env, ctx) {
    // CORS headers for browser requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    };

    // Handle OPTIONS request (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        headers: corsHeaders,
        status: 204 
      });
    }

    try {
      const url = new URL(request.url);
      
      // Pocket Option API endpoint
      const apiUrl = 'https://api.pocketoption.com' + url.pathname + url.search;
      
      // Get request body if any
      let body = null;
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        body = await request.text();
      }

      // Forward the request to Pocket Option API
      const modifiedRequest = new Request(apiUrl, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Cloudflare Worker',
          'Accept': 'application/json',
          ...(body ? { 'Content-Length': body.length.toString() } : {})
        },
        body: body
      });

      const response = await fetch(modifiedRequest);
      const responseText = await response.text();

      // Try to parse as JSON to ensure it's valid
      try {
        JSON.parse(responseText);
      } catch (e) {
        // If not JSON, return as is
        return new Response(responseText, {
          status: response.status,
          headers: {
            ...corsHeaders,
            'Content-Type': response.headers.get('Content-Type') || 'text/plain',
          }
        });
      }

      // Return JSON response with CORS headers
      return new Response(responseText, {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      });
    }
  }
};
