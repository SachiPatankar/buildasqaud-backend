import express from 'express';
import { Request, Response } from 'express';
import { performHealthCheck } from '../lib/health-checks';

const router = express.Router();

// Metrics endpoint for monitoring systems
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const healthStatus = await performHealthCheck();
    
    // Convert to Prometheus-style metrics
    const metrics = [
      `# HELP app_health_status Application health status (1=healthy, 0=unhealthy)`,
      `# TYPE app_health_status gauge`,
      `app_health_status ${healthStatus.status === 'healthy' ? 1 : 0}`,
      '',
      `# HELP app_uptime_seconds Application uptime in seconds`,
      `# TYPE app_uptime_seconds counter`,
      `app_uptime_seconds ${healthStatus.uptime}`,
      '',
      `# HELP app_version_info Application version information`,
      `# TYPE app_version_info gauge`,
      `app_version_info{version="${healthStatus.version}"} 1`,
      '',
      // Database metrics
      `# HELP database_health_status Database health status (1=healthy, 0=unhealthy)`,
      `# TYPE database_health_status gauge`,
      `database_health_status ${healthStatus.checks.database.status === 'healthy' ? 1 : 0}`,
      '',
      `# HELP database_response_time_seconds Database response time in seconds`,
      `# TYPE database_response_time_seconds gauge`,
      `database_response_time_seconds ${(healthStatus.checks.database.responseTime || 0) / 1000}`,
      '',
      // Redis metrics
      `# HELP redis_health_status Redis health status (1=healthy, 0=unhealthy)`,
      `# TYPE redis_health_status gauge`,
      `redis_health_status ${healthStatus.checks.redis.status === 'healthy' ? 1 : 0}`,
      '',
      `# HELP redis_response_time_seconds Redis response time in seconds`,
      `# TYPE redis_response_time_seconds gauge`,
      `redis_response_time_seconds ${(healthStatus.checks.redis.responseTime || 0) / 1000}`,
      '',
      // Memory metrics
      `# HELP memory_usage_percent Memory usage percentage`,
      `# TYPE memory_usage_percent gauge`,
      `memory_usage_percent ${healthStatus.checks.memory.details?.usedPercent || 0}`,
      '',
      // Disk metrics
      `# HELP disk_usage_percent Disk usage percentage`,
      `# TYPE disk_usage_percent gauge`,
      `disk_usage_percent ${healthStatus.checks.disk.details?.usedPercent || 0}`
    ].join('\n');
    
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    res.status(500).send('# Error generating metrics');
  }
});

// Detailed health check with additional info
router.get('/monitoring/detailed', async (req: Request, res: Response) => {
  try {
    const healthStatus = await performHealthCheck();
    
    // Add additional system information
    const detailedStatus = {
      ...healthStatus,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        environment: process.env.NODE_ENV || 'development'
      },
      dependencies: {
        mongoose: require('mongoose').version,
        express: require('express').version,
        redis: 'ioredis', // Version info not easily accessible
        socketio: require('socket.io').version
      }
    };
    
    res.json(detailedStatus);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate detailed health check',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Simple ping endpoint
router.get('/ping', (req: Request, res: Response) => {
  res.json({
    pong: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router; 