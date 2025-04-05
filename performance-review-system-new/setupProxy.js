const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://performance-review-backend.onrender.com', // Backend API URL
      changeOrigin: true, // Adjust the 'Origin' header to match the target
      secure: true, // Ensures secure HTTPS requests
      pathRewrite: {
        '^/api': '/api', // Rewrite the base path if necessary
      },
      logLevel: 'debug', // Helps debug proxy issues during development
    })
  );
};