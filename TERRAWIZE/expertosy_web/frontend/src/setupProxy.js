const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Only apply proxy in development environment
  if (process.env.NODE_ENV === 'development') {
    app.use(
      '/api',
      createProxyMiddleware({
        target: 'http://localhost:5000', // Local backend server
        changeOrigin: true,
        pathRewrite: {
          '^/api': '', // Remove /api prefix when forwarding to backend
        },
        // Add logging only in development
        logLevel: 'debug',
        onError: (err, req, res) => {
          console.error('Proxy Error:', err);
          res.status(500).send('Proxy Error');
        }
      })
    );
  }
  // In production, the API calls will go directly to api.expertosy.com
}; 