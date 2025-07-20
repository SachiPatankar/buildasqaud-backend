# 🔴 Redis Setup Guide

## Overview

Redis is used in BuildASquad for caching chat unread counts and notifications. The application is designed to work **with or without Redis** - if Redis is unavailable, the app will continue to function with degraded performance.

## Development Setup

### Option 1: Install Redis Locally

#### Windows (using WSL or Docker)
```bash
# Using Docker (recommended)
docker run --name redis -p 6379:6379 -d redis:alpine

# Or using WSL
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
```

#### macOS
```bash
# Using Homebrew
brew install redis
brew services start redis

# Or using Docker
docker run --name redis -p 6379:6379 -d redis:alpine
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Option 2: Use Redis Cloud (Free Tier)

1. Sign up at [Redis Cloud](https://redis.com/try-free/)
2. Create a free database
3. Get your connection details
4. Update your `.env` file:

```env
REDIS_URL=redis://username:password@host:port
# OR
REDIS_HOST=your-redis-host
REDIS_PORT=your-redis-port
REDIS_PASSWORD=your-redis-password
```

### Option 3: Run Without Redis

The application will work without Redis, but with these limitations:
- Chat unread counts won't be cached
- Real-time notifications may be slower
- Health checks will show Redis as unhealthy

## Environment Variables

Add these to your `.env` file:

```env
# ─── REDIS CONFIG ─────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=yourredispassword
REDIS_URL=redis://default:yourredispassword@localhost:6379
```

## Testing Redis Connection

### Check if Redis is running:
```bash
# Test Redis connection
redis-cli ping
# Should return: PONG

# Check Redis info
redis-cli info
```

### Test from your application:
```bash
# Start your server
npm start

# Check health endpoint
curl http://localhost:3000/health
```

## Production Setup

### Option 1: Managed Redis Service

#### AWS ElastiCache
```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id buildasquad-redis \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --num-cache-nodes 1
```

#### Google Cloud Memorystore
```bash
# Create Redis instance
gcloud redis instances create buildasquad-redis \
  --size=1 \
  --region=us-central1
```

#### Azure Cache for Redis
```bash
# Create Redis cache
az redis create \
  --name buildasquad-redis \
  --resource-group your-resource-group \
  --location eastus \
  --sku Basic \
  --vm-size c0
```

### Option 2: Self-hosted Redis

#### Docker Compose
```yaml
version: '3.8'
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

volumes:
  redis-data:
```

#### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:alpine
        ports:
        - containerPort: 6379
        volumeMounts:
        - name: redis-storage
          mountPath: /data
      volumes:
      - name: redis-storage
        persistentVolumeClaim:
          claimName: redis-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: redis
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check if Redis is running
   redis-cli ping
   
   # Start Redis if not running
   sudo systemctl start redis-server
   ```

2. **Authentication Failed**
   ```bash
   # Check Redis configuration
   redis-cli -a yourpassword ping
   
   # Update your .env file with correct password
   ```

3. **Port Already in Use**
   ```bash
   # Check what's using port 6379
   lsof -i :6379
   
   # Kill the process or change Redis port
   ```

### Debug Commands

```bash
# Test Redis connection
redis-cli ping

# Check Redis info
redis-cli info

# Monitor Redis commands
redis-cli monitor

# Check Redis memory usage
redis-cli info memory

# Test Redis performance
redis-cli --latency
```

## Health Check Integration

The application includes Redis health checks at these endpoints:

- `GET /health` - Comprehensive health check including Redis
- `GET /health/ready` - Readiness check (includes Redis)
- `GET /monitoring/metrics` - Prometheus metrics including Redis status

### Expected Health Check Response

When Redis is **available**:
```json
{
  "checks": {
    "redis": {
      "status": "healthy",
      "responseTime": 5,
      "details": {
        "host": "localhost",
        "port": 6379,
        "status": "ready",
        "available": true
      }
    }
  }
}
```

When Redis is **unavailable**:
```json
{
  "checks": {
    "redis": {
      "status": "unhealthy",
      "responseTime": 1000,
      "error": "Redis not connected",
      "details": {
        "available": false,
        "status": "disconnected"
      }
    }
  }
}
```

## Performance Considerations

### Redis Configuration for Production

```conf
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
```

### Monitoring Redis

```bash
# Install Redis monitoring tools
npm install -g redis-commander

# Start Redis Commander
redis-commander --redis-host localhost --redis-port 6379
```

## Security Best Practices

1. **Use Strong Passwords**
   ```env
   REDIS_PASSWORD=your-very-strong-password
   ```

2. **Enable SSL/TLS in Production**
   ```env
   REDIS_URL=rediss://username:password@host:port
   ```

3. **Restrict Network Access**
   ```bash
   # Bind Redis to localhost only
   redis-server --bind 127.0.0.1
   ```

4. **Use Redis ACLs**
   ```bash
   # Create user with specific permissions
   redis-cli ACL SETUSER buildasquad on >password ~* &* +@read +@write
   ```

## Fallback Strategy

The application is designed to work without Redis:

1. **Graceful Degradation**: App continues to function
2. **Database Fallback**: Unread counts calculated from MongoDB
3. **Health Check Awareness**: Health checks show Redis as unhealthy
4. **Logging**: Clear warnings when Redis is unavailable

This ensures your application remains functional even if Redis becomes unavailable. 