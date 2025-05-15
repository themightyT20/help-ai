import express, { Request, Response, NextFunction } from 'express';
import { registerRoutes } from './routes';
import { storage } from './storage';

// Create an express app instance to handle API routes only
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes for the API
registerRoutes(app).catch(console.error);

// Add error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({ error: message });
});

/**
 * Main serverless handler function for Cloudflare Pages Functions
 * This processes the incoming request and generates a response using Express
 */
export async function handleRequest(request: Request, env: any) {
  // Set environment variables from Cloudflare
  process.env = { ...process.env, ...env };
  
  return new Promise((resolve) => {
    // Create a response object
    let responseHeaders = {};
    let responseStatus = 200;
    let responseBody = '';
    
    // Mock response methods
    const res = {
      setHeader: (key: string, value: string) => {
        responseHeaders[key] = value;
      },
      getHeader: (key: string) => responseHeaders[key],
      status: (status: number) => {
        responseStatus = status;
        return res;
      },
      send: (body: any) => {
        responseBody = body;
        resolve(new Response(responseBody, {
          status: responseStatus,
          headers: responseHeaders
        }));
      },
      json: (body: any) => {
        responseBody = JSON.stringify(body);
        responseHeaders['Content-Type'] = 'application/json';
        resolve(new Response(responseBody, {
          status: responseStatus,
          headers: responseHeaders
        }));
      },
      end: () => {
        resolve(new Response(responseBody, {
          status: responseStatus,
          headers: responseHeaders
        }));
      }
    };
    
    // Process the request using Express
    app(request, res as unknown as Response, () => {
      resolve(new Response('Not Found', { status: 404 }));
    });
  });
}