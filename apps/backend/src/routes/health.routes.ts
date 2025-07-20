import express from 'express';
import { 
  healthCheckMiddleware, 
  livenessCheck, 
  readinessCheck 
} from '../lib/health-checks';

const router = express.Router();

// Comprehensive health check - checks all dependencies
router.get('/health', healthCheckMiddleware);

// Liveness check - just checks if app is running
router.get('/health/live', livenessCheck);

// Readiness check - checks if app is ready to accept traffic
router.get('/health/ready', readinessCheck);

// Simple status endpoint
router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router; 