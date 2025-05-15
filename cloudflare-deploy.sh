#!/bin/bash
# Cloudflare Pages deployment script

# Ensure we exit on error
set -e

echo "🚀 Building application for Cloudflare Pages deployment..."

# Set environment to production
export NODE_ENV=production

# 1. Build the frontend with Vite
echo "📦 Building frontend..."
npx vite build

# 2. Build the serverless API handler
echo "📦 Building serverless API handler..."
npx esbuild server/serverless.ts --platform=neutral --packages=external --bundle --format=esm --outdir=dist

# 3. Copy Cloudflare specific files to the dist directory
echo "📄 Copying Cloudflare configuration files..."
cp _headers _redirects _routes.json dist/public/

# 4. Copy function files to the functions directory in dist
echo "📄 Setting up Cloudflare Functions..."
mkdir -p dist/public/functions
cp -r functions/* dist/public/functions/

echo "✅ Build complete! The 'dist/public' directory is ready for Cloudflare Pages deployment."
echo
echo "To deploy to Cloudflare Pages:"
echo "1. Install Cloudflare Wrangler CLI: npm install -g wrangler"
echo "2. Login to Cloudflare: wrangler login"
echo "3. Deploy: wrangler pages publish dist/public --project-name=your-project-name"
echo
echo "Or use the Cloudflare Dashboard to deploy the 'dist/public' directory."