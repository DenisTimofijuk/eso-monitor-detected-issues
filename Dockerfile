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

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["npm", "start"]