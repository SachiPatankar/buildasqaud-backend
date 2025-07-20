import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import si from 'systeminformation';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getRedisClient, isRedisConnected } from './redis';

// Health check status types
export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: CheckResult;
    redis: CheckResult;
    s3: CheckResult;
    memory: CheckResult;
    disk: CheckResult;
  };
}

export interface CheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
  details?: any;
}

// Database health check
async function checkDatabase(): Promise<CheckResult> {
  const startTime = Date.now();
  
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: 'MongoDB not connected',
        details: { readyState: mongoose.connection.readyState }
      };
    }

    // Perform a simple query to test connectivity
    await mongoose.connection.db.admin().ping();
    
    return {
      status: 'healthy',
      responseTime: Date.now() - startTime,
      details: {
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown database error',
      details: { readyState: mongoose.connection.readyState }
    };
  }
}

// Redis health check
async function checkRedis(): Promise<CheckResult> {
  const startTime = Date.now();
  
  try {
    const redis = getRedisClient();
    if (!redis || !isRedisConnected()) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: 'Redis not connected',
        details: { 
          available: false,
          status: redis?.status || 'disconnected'
        }
      };
    }
    
    // Test Redis connection with PING
    const result = await redis.ping();
    
    if (result !== 'PONG') {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: 'Redis PING failed',
        details: { response: result }
      };
    }

    return {
      status: 'healthy',
      responseTime: Date.now() - startTime,
      details: {
        host: redis.options.host,
        port: redis.options.port,
        status: redis.status,
        available: true
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Redis connection failed',
      details: { available: false }
    };
  }
}

// AWS S3 health check
async function checkS3(): Promise<CheckResult> {
  const startTime = Date.now();
  
  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    // Test S3 connectivity by checking bucket
    const command = new HeadBucketCommand({
      Bucket: process.env.AWS_BUCKET_NAME!
    });
    
    await s3Client.send(command);
    
    return {
      status: 'healthy',
      responseTime: Date.now() - startTime,
      details: {
        region: process.env.AWS_REGION,
        bucket: process.env.AWS_BUCKET_NAME
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'S3 connection failed'
    };
  }
}

// Memory usage check
async function checkMemory(): Promise<CheckResult> {
  const startTime = Date.now();
  
  try {
    const memInfo = await si.mem();
    const usedPercent = (memInfo.used / memInfo.total) * 100;
    
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (usedPercent > 90) {
      status = 'unhealthy';
    } else if (usedPercent > 80) {
      status = 'degraded';
    }
    
    return {
      status,
      responseTime: Date.now() - startTime,
      details: {
        total: memInfo.total,
        used: memInfo.used,
        free: memInfo.free,
        usedPercent: Math.round(usedPercent * 100) / 100
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Memory check failed'
    };
  }
}

// Disk usage check
async function checkDisk(): Promise<CheckResult> {
  const startTime = Date.now();
  
  try {
    const diskInfo = await si.fsSize();
    const rootDisk = diskInfo.find(disk => disk.mount === '/') || diskInfo[0];
    
    if (!rootDisk) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: 'No disk information available'
      };
    }
    
    const usedPercent = (rootDisk.used / rootDisk.size) * 100;
    
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (usedPercent > 90) {
      status = 'unhealthy';
    } else if (usedPercent > 80) {
      status = 'degraded';
    }
    
    return {
      status,
      responseTime: Date.now() - startTime,
      details: {
        mount: rootDisk.mount,
        size: rootDisk.size,
        used: rootDisk.used,
        available: rootDisk.available,
        usedPercent: Math.round(usedPercent * 100) / 100
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Disk check failed'
    };
  }
}

// Main health check function
export async function performHealthCheck(): Promise<HealthStatus> {
  const [database, redis, s3, memory, disk] = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkS3(),
    checkMemory(),
    checkDisk()
  ]);

  const checks = {
    database: database.status === 'fulfilled' ? database.value : { status: 'unhealthy' as const, error: 'Database check failed' },
    redis: redis.status === 'fulfilled' ? redis.value : { status: 'unhealthy' as const, error: 'Redis check failed' },
    s3: s3.status === 'fulfilled' ? s3.value : { status: 'unhealthy' as const, error: 'S3 check failed' },
    memory: memory.status === 'fulfilled' ? memory.value : { status: 'unhealthy' as const, error: 'Memory check failed' },
    disk: disk.status === 'fulfilled' ? disk.value : { status: 'unhealthy' as const, error: 'Disk check failed' }
  };

  // Determine overall status
  const allChecks = Object.values(checks);
  const unhealthyCount = allChecks.filter(check => check.status === 'unhealthy').length;
  const degradedCount = allChecks.filter(check => check.status === 'degraded').length;

  let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
  
  if (unhealthyCount > 0) {
    overallStatus = 'unhealthy';
  } else if (degradedCount > 0) {
    overallStatus = 'degraded';
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    checks
  };
}

// Express middleware for health checks
export function healthCheckMiddleware(req: Request, res: Response) {
  performHealthCheck()
    .then((healthStatus) => {
      const statusCode = healthStatus.status === 'healthy' ? 200 : 
                        healthStatus.status === 'degraded' ? 200 : 503;
      
      res.status(statusCode).json(healthStatus);
    })
    .catch((error) => {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: error.message
      });
    });
}

// Simple liveness check (just checks if app is running)
export function livenessCheck(req: Request, res: Response) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}

// Readiness check (checks if app is ready to accept traffic)
export function readinessCheck(req: Request, res: Response) {
  // Check if MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Application not ready - database not connected'
    });
  }

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    ready: true
  });
} 