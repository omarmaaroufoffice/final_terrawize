const express = require('express');
const path = require('path');
const compression = require('compression');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 3000;

// Enable compression
app.use(compression());

// Enable CORS
app.use(cors({
  origin: [
    'https://expertosy.com',
    'https://www.expertosy.com',
    'https://app.expertosy.com',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add security headers
app.use((req, res, next) => {
  res.set({
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Cache-Control': 'public, max-age=3600'
  });
  next();
});

// Proxy API requests to the backend
app.use('/api', createProxyMiddleware({
  target: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  changeOrigin: true,
  pathRewrite: {
    '^/api': ''
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add any necessary headers for the backend
    proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.status(500).send('Proxy Error');
  }
}));

// Serve static files from the React app build directory with caching
app.use(express.static(path.join(__dirname, 'build'), {
  maxAge: '1h',
  etag: true,
  lastModified: true
}));

// Handle React routing, return all requests to React app
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).send('Something broke!');
});

// Start server with a longer timeout
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

// Set longer timeouts
server.timeout = 120000; // 2 minutes
server.keepAliveTimeout = 68080; // slightly higher than 60 seconds
server.headersTimeout = 66000; // slightly higher than keepAliveTimeout 