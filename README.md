# AI Chat Application

An advanced AI chat application powered by Mixtral 8x7b, offering a comprehensive conversational experience with cutting-edge features.

## Features

- Advanced AI chat using Mixtral 8x7b
- Web search integration with Seper.dev Google Search API
- Image generation capabilities
- Real-time chat with clickable URLs
- User authentication

## Deployment Instructions for Render

1. **Fork or Clone This Repository**
   Push the code to your GitHub/GitLab account.

2. **Create a Render Account**
   Sign up at [render.com](https://render.com) if you don't have an account.

3. **Deploy via Render Dashboard**

   a. **PostgreSQL Database**:
      - Go to the Render dashboard
      - Click "New" → "PostgreSQL"
      - Configure database name: `ai_chat`
      - Choose the free plan
      - Create database and note the connection string

   b. **Web Service**:
      - Click "New" → "Web Service"
      - Connect your GitHub/GitLab repository
      - Name: `ai-chat-app`
      - Build command: `npm install && npm run build`
      - Start command: `npm start`
      - Select "Environment Variables" and add:
         - `DATABASE_URL`: Your PostgreSQL connection string
         - `NODE_ENV`: production
         - `SEPER_DEV_API_KEY`: Your Seper.dev API key (or set later in dashboard)

4. **Initialize Database**
   After deployment, use the Render shell to run database migrations:
   
   a. Go to your deployed web service in the Render dashboard
   b. Click on "Shell" in the top navigation
   c. Run the following command to set up your database schema:
      ```
      npm run db:push
      ```
   d. This will create all necessary tables based on your schema.ts definitions

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to 'production' for deployment
- `SEPER_DEV_API_KEY`: API key for Seper.dev search
- `SESSION_SECRET`: Secret for session encryption

## API Keys Setup

This application uses several external services that require API keys:

1. **Seper.dev API Key** (Required for web search)
   - Register at [serper.dev](https://serper.dev/)
   - Create an API key in your dashboard
   - Add it to your Render environment variables or in the app settings

2. **Together AI API Key** (Optional - for alternative AI model)
   - Register at [together.ai](https://together.ai/)
   - Create an API key
   - Add it in the app settings after deployment

3. **Stability API Key** (Optional - for image generation)
   - Register at [stability.ai](https://stability.ai/)
   - Create an API key
   - Add it in the app settings after deployment

You can add API keys either directly in your Render environment variables or through the application's settings page after deployment.

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env` file
4. Start the development server: `npm run dev`# help-ai
