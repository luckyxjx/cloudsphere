# CloudSphere Dashboard

An enterprise-grade dashboard application built with React, Node.js, and MongoDB, designed for production deployment with industry-standard practices.

## 🚀 Features

- **Modern Frontend**: React 18 with TypeScript, Tailwind CSS, and Framer Motion
- **Robust Backend**: Node.js/Express with MongoDB and Redis
- **Production Ready**: Docker containerization, monitoring, and auto-scaling
- **Security**: JWT authentication, rate limiting, and security headers
- **Monitoring**: Prometheus metrics and Grafana dashboards
- **CI/CD**: Automated deployment scripts and process management

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │  React Client   │    │  Node.js API    │
│   (Port 80/443) │    │   (Port 3000)   │    │   (Port 3001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   MongoDB +     │
                    │     Redis       │
                    └─────────────────┘
```

## 📋 Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Docker**: 20.10.0 or higher
- **Docker Compose**: 2.0.0 or higher
- **MongoDB**: 7.0 or higher (or use Docker)
- **Redis**: 7.0 or higher (or use Docker)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd cloudsphere-dashboard
npm run install:all
```

### 2. Environment Setup

```bash
cp env.example .env
# Edit .env with your production values
```

### 3. Development Mode

```bash
# Start both server and client in development
npm run dev

# Or start individually
npm run dev:server    # Backend on port 3001
npm run dev:client    # Frontend on port 5173
```

### 4. Production Build

```bash
# Build both applications
npm run build

# Start production server
npm run start:prod
```

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# Start all services
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### Manual Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## 📊 Production Deployment

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start in production mode
pm2 start ecosystem.config.js --env production

# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart cloudsphere-server
```

### Using Deployment Script

```bash
# Make script executable
chmod +x scripts/deploy.sh

# Deploy to production
./scripts/deploy.sh production
```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# Application
NODE_ENV=production
PORT=3001
APP_NAME=CloudSphere Dashboard

# Database
MONGODB_URI=mongodb://admin:password@localhost:27017/cloudsphere
REDIS_URL=redis://:password@localhost:6379

# Security
JWT_SECRET=your-super-secret-key
CORS_ORIGIN=http://localhost:3000

# Monitoring
PROMETHEUS_ENABLED=true
LOG_LEVEL=info
```

### Server Configuration

The server uses a modular configuration system:

- `server/src/config/production.js` - Production settings
- `server/src/index.prod.js` - Production server entry point
- Environment-specific overrides via `.env`

## 📈 Monitoring & Health Checks

### Health Endpoints

- **Server Health**: `GET /health`
- **MongoDB**: Automatic health checks
- **Redis**: Automatic health checks
- **Client**: Static file serving

### Metrics & Monitoring

- **Prometheus**: Available on port 9090
- **Grafana**: Available on port 3001
- **Application Logs**: Winston logging with rotation
- **Process Management**: PM2 monitoring and clustering

## 🔒 Security Features

- **Helmet.js**: Security headers and CSP
- **Rate Limiting**: API request throttling
- **CORS**: Configurable cross-origin policies
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Request sanitization
- **HTTPS Support**: SSL/TLS configuration

## 🧪 Testing

```bash
# Run all tests
npm test

# Test server only
npm run test:server

# Test client only
npm run test:client

# Test with coverage
npm run test:coverage
```

## 📝 Code Quality

```bash
# Lint all code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking (client)
cd updates/dashboard && npm run type-check
```

## 🚀 Deployment Options

### 1. Docker Compose (Local/Staging)
- Complete containerized environment
- Easy local development
- Good for staging environments

### 2. PM2 (Production)
- Process management and clustering
- Auto-restart and monitoring
- Better for production servers

### 3. Kubernetes (Enterprise)
- Scalable container orchestration
- Auto-scaling and load balancing
- Enterprise-grade deployment

## 📁 Project Structure

```
cloudsphere-dashboard/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   └── index.js       # Development server
│   ├── Dockerfile         # Server container
│   └── package.json
├── updates/dashboard/      # Frontend React app
│   ├── src/
│   ├── Dockerfile         # Client container
│   └── package.json
├── scripts/               # Deployment scripts
├── docker-compose.yml     # Service orchestration
├── ecosystem.config.js    # PM2 configuration
├── Dockerfile            # Multi-stage build
└── package.json          # Root package
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          # Your deployment commands
```

## 📊 Performance Optimization

- **Compression**: Gzip compression for responses
- **Caching**: Redis-based caching layer
- **Database**: Connection pooling and indexing
- **Frontend**: Code splitting and lazy loading
- **CDN**: Static asset optimization

## 🆘 Troubleshooting

### Common Issues

1. **Port Conflicts**: Check if ports 3000, 3001, 27017, 6379 are available
2. **MongoDB Connection**: Verify MongoDB is running and accessible
3. **Docker Issues**: Ensure Docker daemon is running
4. **Permission Errors**: Check file permissions for logs and uploads

### Logs Location

- **Application Logs**: `./logs/app.log`
- **PM2 Logs**: `./logs/combined.log`
- **Docker Logs**: `docker-compose logs -f`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/cloudsphere-dashboard/issues)
- **Documentation**: [Wiki](https://github.com/your-org/cloudsphere-dashboard/wiki)
- **Email**: support@cloudsphere.com

---

**Built with ❤️ by the CloudSphere Team**