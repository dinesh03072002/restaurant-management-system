const keepAlive = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const baseURL = API_URL.replace('/api', '');
  
  fetch(`${baseURL}/health`).catch(() => {});
};

// Run when app loads and every 5 minutes while user is active
setInterval(keepAlive, 5 * 60 * 1000);
keepAlive();