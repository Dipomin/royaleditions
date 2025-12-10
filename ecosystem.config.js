module.exports = {
  apps: [
    {
      name: 'royaleditions',
      script: '.next/standalone/server.js',
      cwd: process.cwd(),
      instances: 1, // Mode standalone ne supporte pas le clustering natif
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3001,
        HOSTNAME: '0.0.0.0'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
