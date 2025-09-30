#!/bin/bash

# CloudSphere Dashboard Startup Script
# This script provides easy access to different startup modes

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to show usage
show_usage() {
    echo -e "${BLUE}CloudSphere Dashboard Startup Script${NC}"
    echo ""
    echo "Usage: ./start.sh [OPTION]"
    echo ""
    echo "Options:"
    echo "  dev          Start both server and client in development mode"
    echo "  server       Start only the backend server"
    echo "  client       Start only the frontend client"
    echo "  docker       Start all services using Docker Compose"
    echo "  production   Start in production mode using PM2"
    echo "  stop         Stop all running services"
    echo "  status       Show status of all services"
    echo "  logs         Show logs from all services"
    echo "  help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./start.sh dev        # Development mode"
    echo "  ./start.sh docker     # Docker mode"
    echo "  ./start.sh production # Production mode"
}

# Function to check if services are running
check_status() {
    echo -e "${BLUE}Checking service status...${NC}"
    
    # Check server
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Server: Running on port 3001${NC}"
    else
        echo -e "${YELLOW}✗ Server: Not running${NC}"
    fi
    
    # Check client
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Client: Running on port 3000${NC}"
    else
        echo -e "${YELLOW}✗ Client: Not running${NC}"
    fi
    
    # Check MongoDB
    if docker ps | grep -q cloudsphere-mongodb; then
        echo -e "${GREEN}✓ MongoDB: Running in Docker${NC}"
    else
        echo -e "${YELLOW}✗ MongoDB: Not running${NC}"
    fi
    
    # Check Redis
    if docker ps | grep -q cloudsphere-redis; then
        echo -e "${GREEN}✓ Redis: Running in Docker${NC}"
    else
        echo -e "${YELLOW}✗ Redis: Not running${NC}"
    fi
}

# Function to stop all services
stop_services() {
    echo -e "${YELLOW}Stopping all services...${NC}"
    
    # Stop PM2 processes
    if command -v pm2 &> /dev/null; then
        pm2 stop all 2>/dev/null || true
        pm2 delete all 2>/dev/null || true
    fi
    
    # Stop Docker services
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Kill any remaining Node processes
    pkill -f "node.*cloudsphere" 2>/dev/null || true
    
    echo -e "${GREEN}All services stopped${NC}"
}

# Main script logic
case "${1:-dev}" in
    "dev")
        echo -e "${GREEN}Starting CloudSphere Dashboard in development mode...${NC}"
        npm run dev
        ;;
    "server")
        echo -e "${GREEN}Starting backend server...${NC}"
        npm run dev:server
        ;;
    "client")
        echo -e "${GREEN}Starting frontend client...${NC}"
        npm run dev:client
        ;;
    "docker")
        echo -e "${GREEN}Starting CloudSphere Dashboard with Docker...${NC}"
        echo -e "${YELLOW}Make sure you have a .env file configured${NC}"
        npm run docker:up
        echo -e "${GREEN}Services started! Access at:${NC}"
        echo -e "  Frontend: http://localhost:3000"
        echo -e "  Backend:  http://localhost:3001"
        echo -e "  MongoDB:  localhost:27017"
        echo -e "  Redis:    localhost:6379"
        ;;
    "production")
        echo -e "${GREEN}Starting CloudSphere Dashboard in production mode...${NC}"
        echo -e "${YELLOW}Make sure you have a .env file configured${NC}"
        
        # Check if PM2 is installed
        if ! command -v pm2 &> /dev/null; then
            echo -e "${YELLOW}PM2 not found. Installing...${NC}"
            npm install -g pm2
        fi
        
        # Build the application
        npm run build
        
        # Start with PM2
        pm2 start ecosystem.config.js --env production
        
        echo -e "${GREEN}Production services started!${NC}"
        echo -e "Monitor with: pm2 monit"
        echo -e "View logs with: pm2 logs"
        ;;
    "stop")
        stop_services
        ;;
    "status")
        check_status
        ;;
    "logs")
        echo -e "${BLUE}Showing service logs...${NC}"
        echo -e "${YELLOW}Press Ctrl+C to exit${NC}"
        
        # Show Docker logs if running
        if docker ps | grep -q cloudsphere; then
            docker-compose logs -f
        else
            echo -e "${YELLOW}No Docker services running${NC}"
        fi
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        echo -e "${YELLOW}Unknown option: $1${NC}"
        show_usage
        exit 1
        ;;
esac
