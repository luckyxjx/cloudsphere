module.exports = {
  apps: [
    {
      name: 'cloudsphere-server',
      script: './server/dist/index.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        MONGODB_URI: 'mongodb://admin:securepassword@localhost:27017/cloudsphere?authSource=admin',
        REDIS_URL: 'redis://:redispass@localhost:6379',
        JWT_SECRET: 'your-super-secret-jwt-key-change-in-production',
        CORS_ORIGIN: 'http://localhost:3000',
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3001,
        MONGODB_URI: 'mongodb://admin:securepassword@localhost:27017/cloudsphere?authSource=admin',
        REDIS_URL: 'redis://:redispass@localhost:6379',
        JWT_SECRET: 'your-super-secret-jwt-key-change-in-production',
        CORS_ORIGIN: 'http://localhost:3000',
      },
      // Process management
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Monitoring
      pmx: true,
      monitor: true,
      
      // Health check
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Watch mode (development only)
      watch: false,
      ignore_watch: ['node_modules', 'logs', '*.log'],
      
      // Environment variables
      env_file: '.env',
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Auto restart on file changes (development)
      autorestart: true,
      
      // Cron jobs
      cron_restart: '0 2 * * *', // Restart daily at 2 AM
      
      // Memory and CPU limits
      node_args: '--max-old-space-size=1024',
      
      // Error handling
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      
      // Merge logs
      merge_logs: true,
      
      // Source map support
      source_map_support: true,
    },
  ],
  
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-production-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-org/cloudsphere-dashboard.git',
      path: '/var/www/cloudsphere-dashboard',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
    staging: {
      user: 'deploy',
      host: 'your-staging-server.com',
      ref: 'origin/develop',
      repo: 'git@github.com:your-org/cloudsphere-dashboard.git',
      path: '/var/www/cloudsphere-dashboard-staging',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      'pre-setup': '',
    },
  },
};
