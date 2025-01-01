# Build stage
FROM node:18.17-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object@7.21.11

# Copy source code
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false

# Build the application with explicit environment
RUN NODE_ENV=production npm run build

# Production stage
FROM node:18.17-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files and server
COPY --from=builder /app/build ./build
COPY server.js .

# Set production environment
ENV NODE_ENV=production



# Start the server
CMD ["node", "server.js"] 