# Deploying to Cloudflare Pages

This guide provides instructions on how to deploy the AI Chat App to Cloudflare Pages with Cloudflare Functions.

## Prerequisites

- Cloudflare account
- Access to a PostgreSQL database (we recommend using Neon.tech for serverless PostgreSQL)
- Required API keys for the application

## Deployment Steps

### Method 1: Using the Cloudflare Dashboard (Manual)

1. Log in to your Cloudflare dashboard
2. Navigate to Workers & Pages > Create application > Pages
3. Connect your GitHub/GitLab repository
4. Configure your build settings:
   - Build command: `chmod +x ./cloudflare-deploy.sh && ./cloudflare-deploy.sh`
   - Build output directory: `dist/public`
5. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: Generate a random string
   - Any API keys required by your application
6. Deploy your site

### Method 2: Using Wrangler CLI

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Build the application:
   ```bash
   chmod +x ./cloudflare-deploy.sh && ./cloudflare-deploy.sh
   ```

4. Deploy to Cloudflare Pages:
   ```bash
   wrangler pages deploy dist/public --project-name=ai-chat-app
   ```

5. Configure environment variables:
   ```bash
   wrangler pages deployment tail
   wrangler pages deployment env set DATABASE_URL=your-postgres-connection-string
   wrangler pages deployment env set SESSION_SECRET=your-session-secret
   ```

## Database Configuration

This application is configured to work with PostgreSQL in serverless environments. We recommend using Neon.tech for serverless PostgreSQL:

1. Create a PostgreSQL database on Neon.tech or your preferred provider
2. Get the connection string
3. Add it as the `DATABASE_URL` environment variable in your Cloudflare Pages settings

## Testing Your Deployment

After deployment, your site will be available at `https://your-project-name.pages.dev`. 

Verify that:
- The frontend loads correctly
- API requests to `/api/*` endpoints work
- Database connections are functioning properly

## Notes on Serverless Environment

- This application uses Drizzle ORM with Neon serverless PostgreSQL adapter for database operations
- Session management uses in-memory storage for serverless environments
- API functionality is handled by Cloudflare Functions in the `/functions` directory

## Common Issues

- **Database Connection Issues**: Ensure your DATABASE_URL is correctly set and includes SSL parameters
- **Missing API Keys**: Verify all required API keys are set in environment variables
- **Build Failures**: Check build logs for specific errors; ensure all functions are exported correctly
- **API Endpoints Not Working**: Verify that the Functions are properly deployed in the `/functions` directory