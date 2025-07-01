# ESO Monitoring System

A Node.js application that automatically monitors specific geographic zones for data changes and sends email notifications when updates are detected. Built with TypeScript and designed to run as a Docker container on TrueNAS or other container platforms.

## Features

- 🔍 **Zone-based monitoring** - Monitor rectangular geographic areas
- 📧 **Email notifications** - Automated email alerts with HTML templates
- ⏰ **Scheduled checks** - Configurable interval-based monitoring
- 🏥 **Health monitoring** - Built-in health check and status endpoints
- 🐳 **Docker ready** - Containerized for easy deployment
- 📊 **Logging system** - Persistent logs with rotation
- 🛡️ **Graceful shutdown** - Proper cleanup on termination signals

## Architecture

```
src/
├── index.ts              # Application entry point
├── app.ts                # Main application class
├── appHandler.ts         # Core monitoring logic
├── ZoneChecker.ts        # Geographic zone management
├── services/
│   ├── EmailService.ts   # Email notification service
│   └── SchedulerService.ts # Job scheduling service
├── utils/
│   ├── eventListeners.ts # Event handling setup
│   └── createHTMLMessageUsingTemplate.ts
└── config/
    └── config.ts         # Configuration management
```

## Requirements

- Node.js 18+
- Docker (for containerized deployment)
- SMTP email account for notifications

## Installation

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd eso-monitoring

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit configuration
nano .env

# Build the project
npm run build

# Start development server
npm run dev
```

### Docker Deployment

```bash
# Build the Docker image
npm run docker:build

# Run the container
npm run docker:run

# Or run in detached mode
npm run docker:run-detached
```

## Configuration

Create a `.env` file in the root directory:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
REC_EMAIL=recipient@example.com

# Monitoring Configuration
INTERVAL_HOURS=2

# Zone Configuration (Pikutiškės area)
ZONE_TOP_LEFT_LAT=54.7234
ZONE_TOP_LEFT_LNG=25.2134
ZONE_BOTTOM_RIGHT_LAT=54.7134
ZONE_BOTTOM_RIGHT_LNG=25.2234
```

### Gmail Setup

For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASSWORD`

## API Endpoints

The application exposes monitoring endpoints:

- `GET /health` - Health check status
- `GET /status` - Detailed application status

```bash
# Check if the service is running
curl http://localhost:3000/health

# Get detailed status
curl http://localhost:3000/status
```

## TrueNAS Deployment

### Using TrueNAS SCALE Custom App

1. **Build and push your image:**
   ```bash
   docker build -t your-registry/eso-monitor .
   docker push your-registry/eso-monitor
   ```

2. **Create Custom App in TrueNAS:**
   - Go to Apps → Discover Apps → Custom App
   - Configure the following:

   **Application Configuration:**
   - Application Name: `eso-monitor`
   - Image Repository: `your-registry/eso-monitor`
   - Image Tag: `latest`

   **Environment Variables:**
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   REC_EMAIL=recipient@example.com
   INTERVAL_HOURS=2
   # ... other config variables
   ```

   **Storage:**
   - Mount Path: `/app/logs`
   - Host Path: `/mnt/your-pool/eso-monitor/logs`

   **Networking:**
   - Port: `3000` (host) → `3000` (container)

### Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  eso-monitor:
    build: .
    container_name: eso-monitor
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./logs:/app/logs
      - /etc/localtime:/etc/localtime:ro
    environment:
      - EMAIL_USER=${EMAIL_USER}
      - EMAIL_PASSWORD=${EMAIL_PASSWORD}
      - REC_EMAIL=${REC_EMAIL}
      - INTERVAL_HOURS=${INTERVAL_HOURS}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Monitoring & Logs

### Log Files

Logs are stored in the `logs/` directory:
- Application logs with rotation
- Error logs for debugging
- Monitoring cycle results

### Health Monitoring

Monitor the application status:

```bash
# Check health
curl http://your-truenas-ip:3000/health

# Get detailed status
curl http://your-truenas-ip:3000/status
```

### Grafana Integration (Optional)

The application can be extended to export metrics for Grafana dashboards:
- Monitoring cycle success/failure rates
- Email notification delivery status
- Zone check response times

## Development

### Project Structure

- **`index.ts`** - Entry point with process management
- **`app.ts`** - Main application class with lifecycle management
- **`appHandler.ts`** - Core monitoring business logic
- **Services** - Modular services (Email, Scheduler)
- **Utils** - Helper functions and utilities

### Available Scripts

```bash
npm run dev          # Development with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production build
npm run docker:build # Build Docker image
npm run docker:run   # Run Docker container with logs mounted
```

### Adding New Features

1. **New monitoring zones:**
   ```typescript
   checker.addRectangleZone("NewZone", topLeft, bottomRight);
   ```

2. **Additional notification channels:**
   - Extend `EmailService` or create new notification services
   - Add to the application initialization

3. **Custom monitoring logic:**
   - Modify `appHandler.ts` for different data sources
   - Add new endpoints for manual triggers

## Troubleshooting

### Common Issues

**Email notifications not working:**
- Check Gmail App Password configuration
- Verify firewall allows SMTP connections
- Check logs for authentication errors

**Container not starting:**
- Verify environment variables are set
- Check Docker logs: `docker logs eso-monitor`
- Ensure logs directory has proper permissions

**Health check failures:**
- Check if port 3000 is accessible
- Verify container networking configuration
- Check application logs for startup errors

### Debug Mode

Enable verbose logging by setting:
```env
NODE_ENV=development
DEBUG=*
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for personal use. Modify and distribute as needed.

---

## Support

For issues or questions:
- Check the logs in `logs/` directory
- Review health endpoints for status
- Create an issue in the repository

--
*Start Docker service* 
`sudo systemctl start docker`