#!/bin/bash

# CloudSphere Dashboard Production Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="CloudSphere Dashboard"
DEPLOYMENT_ENV=${1:-production}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/${TIMESTAMP}"
LOG_FILE="./logs/deployment_${TIMESTAMP}.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}✗ $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Create necessary directories
mkdir -p logs backups

log "Starting deployment of $APP_NAME to $DEPLOYMENT_ENV environment"

# Check prerequisites
log "Checking prerequisites..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    error "Docker is not running. Please start Docker and try again."
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose is not installed. Please install it and try again."
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    warning ".env file not found. Creating from template..."
    cp env.example .env
    warning "Please update .env file with your production values before continuing."
    read -p "Press Enter to continue after updating .env file..."
fi

# Backup current deployment
log "Creating backup of current deployment..."
if [ -d "current" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -r current/* "$BACKUP_DIR/"
    success "Backup created at $BACKUP_DIR"
fi

# Stop current services
log "Stopping current services..."
docker-compose down --remove-orphans || warning "No services to stop"

# Pull latest changes
log "Pulling latest changes..."
git pull origin main || warning "Could not pull latest changes"

# Build and start services
log "Building and starting services..."
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be healthy
log "Waiting for services to be healthy..."
sleep 30

# Health checks
log "Performing health checks..."

# Check server health
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    success "Server is healthy"
else
    error "Server health check failed"
fi

# Check MongoDB
if docker exec cloudsphere-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    success "MongoDB is healthy"
else
    error "MongoDB health check failed"
fi

# Check Redis
if docker exec cloudsphere-redis redis-cli ping > /dev/null 2>&1; then
    success "Redis is healthy"
else
    error "Redis health check failed"
fi

# Check client
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    success "Client is healthy"
else
    error "Client health check failed"
fi

# Update current deployment
log "Updating current deployment..."
rm -rf current
mkdir -p current
cp -r . current/

# Cleanup old backups (keep last 5)
log "Cleaning up old backups..."
cd backups
ls -t | tail -n +6 | xargs -r rm -rf
cd ..

# Final status
log "Deployment completed successfully!"
success "$APP_NAME is now running in $DEPLOYMENT_ENV environment"
success "Access your application at: http://localhost:3000"
success "API endpoint: http://localhost:3001"
success "Monitoring: http://localhost:9090 (Prometheus), http://localhost:3001 (Grafana)"

# Show running containers
log "Current running containers:"
docker-compose ps

log "Deployment log saved to: $LOG_FILE"
