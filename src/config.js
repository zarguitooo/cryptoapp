// Get the current hostname and protocol
const hostname = window.location.hostname;
const protocol = window.location.protocol;

// If running locally, use port 4000, otherwise use the same origin
export const API_BASE_URL = hostname === 'localhost' 
  ? 'http://localhost:4000'
  : ''; 