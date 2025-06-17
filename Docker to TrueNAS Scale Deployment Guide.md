# Docker to TrueNAS Scale Deployment Guide

This guide covers how to deploy a Node.js application from Docker Hub to TrueNAS Scale as a custom app.

## Common Issues and Solutions

### Permission Denied Error (EACCES)
**Problem**: `npm error code EACCES` when container tries to read package.json

**Root Cause**: Switching to non-root user (`USER node`) before copying all files and setting proper permissions.

**Solution**: Fix Dockerfile structure:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies as root
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY dist ./dist

# Create logs directory and set proper permissions
RUN mkdir -p logs

# Change ownership of the entire app directory to node user
RUN chown -R node:node /app

# Switch to non-root user AFTER setting permissions
USER node

# Create volume mount point for logs
VOLUME ["/app/logs"]

EXPOSE 3000

# Health check (use wget instead of curl for Alpine)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["npm", "start"]
```

**Key Points**:
- Copy files BEFORE switching to non-root user
- Use `chown -R node:node /app` to set proper ownership
- Use `wget` instead of `curl` for Alpine Linux health checks

## Deployment Steps

### 1. Build and Push to Docker Hub

```bash
# Build image
docker build -t your-dockerhub-username/your-app-name:latest .

# Login to Docker Hub
docker login

# Push image
docker push your-dockerhub-username/your-app-name:latest
```

### 2. Deploy on TrueNAS Scale

#### Via Web UI (Recommended)
1. Navigate to `Apps` → `Discover Apps` → `Custom App`
2. Configure:
   - **Application Name**: `your-app-name`
   - **Image Repository**: `your-dockerhub-username/your-app-name`
   - **Image Tag**: `latest`
   - **Container Port**: `3000`
   - **Node Port**: `3000`
3. Add storage volume:
   - **Host Path**: `/mnt/your-pool/your-app-logs`
   - **Mount Path**: `/app/logs`
4. Add environment variables if needed
5. Click `Install`

#### Preparation Steps
```bash
# Create log directory on TrueNAS Scale
mkdir -p /mnt/your-pool/your-app-logs
chmod 755 /mnt/your-pool/your-app-logs
```

### 3. Useful Package.json Scripts

Add these convenience scripts:
```json
{
  "scripts": {
    "docker:build": "docker build -t your-app-name .",
    "docker:tag": "docker tag your-app-name your-dockerhub-username/your-app-name:latest",
    "docker:push": "docker push your-dockerhub-username/your-app-name:latest",
    "docker:publish": "npm run docker:build && npm run docker:tag && npm run docker:push"
  }
}
```

## Troubleshooting

- **Permission issues**: Ensure Dockerfile copies files before switching users
- **Port conflicts**: Check if ports are already in use on TrueNAS Scale
- **Storage issues**: Verify mounted directories exist and have proper permissions
- **Health check failures**: Use `wget` instead of `curl` for Alpine Linux images
- **Container logs**: Check TrueNAS Apps interface for container logs

## Best Practices

1. Always use non-root users in production containers
2. Set proper file ownership before switching users
3. Use health checks for better container management
4. Mount persistent volumes for logs and data
5. Use specific image tags instead of `latest` for production deployments