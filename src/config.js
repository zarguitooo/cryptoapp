// Get the current hostname
const hostname = window.location.hostname;

// If running on localhost, use the current hostname
// Otherwise, use the server's IP address
export const API_BASE_URL = `http://${hostname}:4000`; 