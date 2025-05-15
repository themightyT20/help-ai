// Cloudflare Pages Functions adapter for the Express API
export async function onRequest(context) {
  // Set the environment variable to indicate we're in Cloudflare Pages
  context.env.CF_PAGES = 'true';
  context.env.NODE_ENV = 'cloudflare';
  
  // If the request is for an API endpoint, proxy to our Express server
  const url = new URL(context.request.url);
  if (url.pathname.startsWith('/api/')) {
    try {
      // Dynamically import the server handler
      const { handleRequest } = await import('../dist/serverless.js');
      return await handleRequest(context.request, context.env);
    } catch (err) {
      console.error('Error handling API request:', err);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
  
  // For non-API requests, let Cloudflare Pages handle static assets
  return context.next();
}