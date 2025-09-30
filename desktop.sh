#!/bin/bash

# CloudSphere Dashboard Desktop App Launcher
# This script launches the Electron desktop application

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 CloudSphere Dashboard Desktop App${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "updates/dashboard/package.json" ]; then
    echo -e "${YELLOW}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

cd updates/dashboard

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Check if Electron is installed
if ! npm list electron > /dev/null 2>&1; then
    echo -e "${YELLOW}Installing Electron...${NC}"
    npm install
fi

echo -e "${GREEN}Starting CloudSphere Dashboard Desktop App...${NC}"
echo -e "${BLUE}Make sure your backend server is running on port 3001${NC}"
echo ""

# Launch the desktop app
npm run electron:dev

