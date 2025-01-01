# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and required Babel plugin
RUN npm install
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built files and server
COPY --from=builder /app/build ./build
COPY server.js .

# Set environment variables
ENV NODE_ENV=production

# Expose the port (will be overridden by Railway's PORT)
EXPOSE ${PORT:-3000}

# Start the server
CMD ["node", "server.js"] 