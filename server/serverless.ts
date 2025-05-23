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
export async function handleRequest(request: Request, env: Record<string, string>) {
  // Set environment variables from Cloudflare
  process.env = { ...process.env, ...env };
  
  return new Promise<Response>((resolve) => {
    // Create a response object
    const responseHeaders: Headers = new Headers();
    let responseStatus = 200;
    let responseBody = '';
    
    // Define a custom WebResponse that mimics Express Response
    type WebResponse = {
      setHeader(key: string, value: string): WebResponse;
      getHeader(key: string): string | undefined;
      status(status: number): WebResponse;
      send(body: any): void;
      json(body: any): void;
      end(): void;
    };
    
    // Mock response methods
    const res: WebResponse = {
      setHeader: (key: string, value: string) => {
        responseHeaders.set(key, value);
        return res;
      },
      getHeader: (key: string) => responseHeaders.get(key) || undefined,
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
        responseHeaders.set('Content-Type', 'application/json');
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