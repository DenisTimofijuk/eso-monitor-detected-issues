FROM node:18-alpine

WORKDIR /app

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R node:node logs

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY dist ./dist

# Create non-root user for security
USER node

# Create volume mount point for logs (optional)
VOLUME ["/app/logs"]

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]