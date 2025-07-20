# 🏥 Health Checks Documentation

## Overview

The BuildASquad backend now includes comprehensive health checks to monitor application status, dependencies, and system resources. These endpoints are essential for production monitoring and load balancer integration.

## Available Endpoints

### 1. **Comprehensive Health Check**
```
GET /health
```

**Purpose**: Full system health assessment
**Response**: Detailed status of all dependencies and system metrics
**Use Case**: Primary health check for load balancers and monitoring systems

**Example Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 15,
      "details": {
        "readyState": 1,
        "host": "localhost",
        "port": 27017,
        "name": "buildasquad"
      }
    },
    "redis": {
      "status": "healthy",
      "responseTime": 5,
      "details": {
        "host": "127.0.0.1",
        "port": 6379,
        "status": "ready"
      }
    },
    "s3": {
      "status": "healthy",
      "responseTime": 120,
      "details": {
        "region": "ap-south-1",
        "bucket": "buildasquad-bucket"
      }
    },
    "memory": {
      "status": "healthy",
      "responseTime": 2,
      "details": {
        "total": 8589934592,
        "used": 4294967296,
        "free": 4294967296,
        "usedPercent": 50.0
      }
    },
    "disk": {
      "status": "healthy",
      "responseTime": 3,
      "details": {
        "mount": "/",
        "size": 107374182400,
        "used": 53687091200,
        "available": 53687091200,
        "usedPercent": 50.0
      }
    }
  }
}
```

### 2. **Liveness Check**
```
GET /health/live
```

**Purpose**: Quick check if application is running
**Response**: Simple status without dependency checks
**Use Case**: Kubernetes liveness probes, basic uptime monitoring

**Example Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

### 3. **Readiness Check**
```
GET /health/ready
```

**Purpose**: Check if application is ready to accept traffic
**Response**: Status indicating if app can handle requests
**Use Case**: Kubernetes readiness probes, deployment verification

**Example Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "ready": true
}
```

### 4. **Simple Status**
```
GET /status
```

**Purpose**: Basic application status
**Response**: Minimal status information
**Use Case**: Quick health verification

**Example Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### 5. **Prometheus Metrics**
```
GET /monitoring/metrics
```

**Purpose**: Metrics in Prometheus format
**Response**: Metrics for monitoring systems
**Use Case**: Prometheus, Grafana, monitoring dashboards

**Example Response**:
```
# HELP app_health_status Application health status (1=healthy, 0=unhealthy)
# TYPE app_health_status gauge
app_health_status 1

# HELP app_uptime_seconds Application uptime in seconds
# TYPE app_uptime_seconds counter
app_uptime_seconds 3600

# HELP database_health_status Database health status (1=healthy, 0=unhealthy)
# TYPE database_health_status gauge
database_health_status 1

# HELP database_response_time_seconds Database response time in seconds
# TYPE database_response_time_seconds gauge
database_response_time_seconds 0.015
```

### 6. **Detailed Monitoring**
```
GET /monitoring/detailed
```

**Purpose**: Comprehensive system information
**Response**: Detailed status with system metrics
**Use Case**: Debugging, detailed monitoring

**Example Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "checks": { /* health checks */ },
  "system": {
    "nodeVersion": "v18.16.0",
    "platform": "linux",
    "arch": "x64",
    "pid": 12345,
    "memoryUsage": {
      "rss": 123456789,
      "heapTotal": 987654321,
      "heapUsed": 456789123,
      "external": 12345678
    },
    "cpuUsage": {
      "user": 123456,
      "system": 789012
    },
    "environment": "production"
  },
  "dependencies": {
    "mongoose": "8.13.2",
    "express": "4.21.2",
    "redis": "ioredis",
    "socketio": "4.8.1"
  }
}
```

### 7. **Ping Endpoint**
```
GET /ping
```

**Purpose**: Simple connectivity test
**Response**: Basic ping response
**Use Case**: Network connectivity testing

**Example Response**:
```json
{
  "pong": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

## Status Codes

- **200**: Healthy - All systems operational
- **503**: Unhealthy - Critical dependencies down
- **500**: Error - Health check failed

## Health Check Logic

### Status Determination
- **Healthy**: All critical dependencies operational
- **Degraded**: Some non-critical issues (high memory/disk usage)
- **Unhealthy**: Critical dependencies down (database, Redis)

### Critical Dependencies
1. **MongoDB**: Database connectivity and query execution
2. **Redis**: Cache connectivity and PING response
3. **AWS S3**: File storage connectivity

### System Metrics
1. **Memory Usage**: 
   - Healthy: < 80%
   - Degraded: 80-90%
   - Unhealthy: > 90%

2. **Disk Usage**:
   - Healthy: < 80%
   - Degraded: 80-90%
   - Unhealthy: > 90%

## Production Usage

### Kubernetes Configuration
```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Load Balancer Configuration
```nginx
# Health check for load balancer
location /health {
    proxy_pass http://backend:3000/health;
    access_log off;
}
```

### Monitoring Integration
```yaml
# Prometheus configuration
scrape_configs:
  - job_name: 'buildasquad-backend'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: /monitoring/metrics
    scrape_interval: 30s
```

## Environment Variables

The health checks use these environment variables:
- `REDIS_URL` / `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD`
- `AWS_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_BUCKET_NAME`
- `NX_MONGO_URL` (for MongoDB connection)

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB connection string
   - Verify network connectivity
   - Check MongoDB service status

2. **Redis Connection Failed**
   - Verify Redis server is running
   - Check Redis connection parameters
   - Test Redis connectivity manually

3. **S3 Connection Failed**
   - Verify AWS credentials
   - Check bucket permissions
   - Validate region configuration

4. **High Memory Usage**
   - Monitor application memory usage
   - Check for memory leaks
   - Consider increasing server resources

### Debug Commands
```bash
# Test MongoDB connection
mongo "mongodb://localhost:27017/buildasquad" --eval "db.adminCommand('ping')"

# Test Redis connection
redis-cli ping

# Test S3 access
aws s3 ls s3://your-bucket-name

# Check system resources
free -h
df -h
```

## Security Considerations

- Health check endpoints should be accessible to monitoring systems
- Consider IP whitelisting for production environments
- Avoid exposing sensitive information in health check responses
- Use HTTPS in production for secure health check communication 