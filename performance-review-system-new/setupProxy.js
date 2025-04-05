const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://performance-review-backend.onrender.com',
      changeOrigin: true,
      secure: false,
    })
  );
};