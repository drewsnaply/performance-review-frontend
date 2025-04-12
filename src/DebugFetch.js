// Create a file called DebugFetch.js in your src directory
// This will override the fetch function temporarily to help us debug

(function() {
    const originalFetch = window.fetch;
    
    window.fetch = function(...args) {
      const url = args[0];
      
      // Only log for the problematic endpoint
      if (typeof url === 'string' && url.includes('/api/templates/assignments')) {
        console.log('%c FETCH CALLED FOR ' + url, 'background: red; color: white');
        console.log('Call stack:', new Error().stack);
      }
      
      return originalFetch.apply(this, args);
    };
  })();
  
  console.log('Fetch debugger installed!');