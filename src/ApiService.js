// ApiService.js - Create this file in your src directory
// This is a service that will manage all API requests and prevent duplicate calls

// Map to store pending requests
const pendingRequests = new Map();
// Map to store cached responses
const responseCache = new Map();
// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

/**
 * Makes API requests with built-in deduplication and caching
 * to prevent duplicate requests to the same endpoint
 */
const ApiService = {
  /**
   * Get the API base URL
   * @returns {string} The API base URL
   */
  getBaseUrl() {
    return process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : 'https://performance-review-backend-ab8z.onrender.com';
  },

  /**
   * Generate a unique key for a request
   * @param {string} url - The URL
   * @param {string} method - The HTTP method
   * @param {Object} data - The request body
   * @returns {string} A unique key for the request
   */
  getRequestKey(url, method, data) {
    return `${method}:${url}:${data ? JSON.stringify(data) : ''}`;
  },

  /**
   * Make an API request
   * @param {string} url - The URL
   * @param {Object} options - Fetch options
   * @param {boolean} useCache - Whether to use cache
   * @returns {Promise<any>} The response
   */
  async request(url, options = {}, useCache = true) {
    const fullUrl = `${this.getBaseUrl()}${url}`;
    const method = options.method || 'GET';
    const key = this.getRequestKey(fullUrl, method, options.body);
    
    // Return cached response if available and cache is enabled
    if (useCache && method === 'GET' && responseCache.has(key)) {
      const { data, timestamp } = responseCache.get(key);
      // Check if cache is still valid
      if (Date.now() - timestamp < CACHE_EXPIRATION) {
        console.log(`Using cached response for ${method} ${url}`);
        return Promise.resolve(data);
      } else {
        // Cache expired, remove it
        responseCache.delete(key);
      }
    }
    
    // If there is already a pending request for this key, return that promise
    if (pendingRequests.has(key)) {
      console.log(`Request already in progress for ${method} ${url}`);
      return pendingRequests.get(key);
    }
    
    // Set default headers
    if (!options.headers) {
      options.headers = {};
    }
    
    // Add authorization header if token exists
    const token = localStorage.getItem('authToken');
    if (token && !options.headers['Authorization']) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add content type if not set and we have a body
    if (options.body && !options.headers['Content-Type']) {
      options.headers['Content-Type'] = 'application/json';
    }
    
    // Create the request promise
    const requestPromise = fetch(fullUrl, options)
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`Request failed with status ${response.status}: ${text || response.statusText}`);
          });
        }
        return response.json();
      })
      .then(data => {
        // Store in cache if it's a GET request and cache is enabled
        if (useCache && method === 'GET') {
          responseCache.set(key, {
            data,
            timestamp: Date.now()
          });
        }
        return data;
      })
      .finally(() => {
        // Remove from pending requests when done
        pendingRequests.delete(key);
      });
    
    // Store the promise so subsequent calls can reuse it
    pendingRequests.set(key, requestPromise);
    
    return requestPromise;
  },

  /**
   * Make a GET request
   * @param {string} url - The URL
   * @param {boolean} useCache - Whether to use cache
   * @returns {Promise<any>} The response
   */
  get(url, useCache = true) {
    return this.request(url, { method: 'GET' }, useCache);
  },

  /**
   * Make a POST request
   * @param {string} url - The URL
   * @param {Object} data - The request body
   * @returns {Promise<any>} The response
   */
  post(url, data) {
    return this.request(
      url,
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      false
    );
  },

  /**
   * Make a PUT request
   * @param {string} url - The URL
   * @param {Object} data - The request body
   * @returns {Promise<any>} The response
   */
  put(url, data) {
    return this.request(
      url,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      },
      false
    );
  },

  /**
   * Make a DELETE request
   * @param {string} url - The URL
   * @returns {Promise<any>} The response
   */
  delete(url) {
    return this.request(
      url,
      {
        method: 'DELETE'
      },
      false
    );
  },

  /**
   * Clear the cache for a specific URL
   * @param {string} url - The URL
   */
  clearCache(url) {
    const fullUrl = `${this.getBaseUrl()}${url}`;
    for (const [key] of responseCache) {
      if (key.includes(fullUrl)) {
        responseCache.delete(key);
      }
    }
  },

  /**
   * Clear the entire cache
   */
  clearAllCache() {
    responseCache.clear();
  }
};

export default ApiService;