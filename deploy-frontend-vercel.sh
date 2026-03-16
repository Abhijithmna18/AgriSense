#!/bin/bash

# Vercel Frontend-Only Deployment Script
# Usage: ./deploy-frontend-vercel.sh [deploy|prod]

set -e

DEPLOY_TYPE=${1:-deploy}
FRONTEND_DIR="farmer_ai-frontend"

echo ""
echo "=========================================="
echo "  Vercel Frontend Deployment"
echo "=========================================="
echo "Deploy Type: $DEPLOY_TYPE"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_info() {
  echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
  print_error "Vercel CLI not found. Installing..."
  npm install -g vercel
fi

print_status "Vercel CLI found"

# Navigate to frontend directory
cd "$FRONTEND_DIR"

echo ""
print_info "Installing dependencies..."
npm install

print_status "Dependencies installed"

echo ""
print_info "Building frontend..."
npm run build

if [ ! -d "dist" ]; then
  print_error "Build failed: dist directory not found"
  exit 1
fi

print_status "Build successful"

echo ""
print_info "Deploying to Vercel..."

if [ "$DEPLOY_TYPE" = "prod" ]; then
  print_info "Deploying to PRODUCTION..."
  vercel --prod
else
  print_info "Deploying to PREVIEW..."
  vercel
fi

print_status "Deployment complete!"

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Check deployment: vercel logs --follow"
echo "2. Add environment variables in Vercel dashboard"
echo "3. Configure custom domain (optional)"
echo "4. Monitor: https://vercel.com/dashboard"
echo ""

cd ..
