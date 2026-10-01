// Utility for making authenticated requests to the Express backend

const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // If no Content-Type is set and we're sending a JSON body, set it
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized globally if needed (e.g., redirect to login)
  if (response.status === 401) {
    // COMMENTED OUT FOR MOCKING:
    // localStorage.removeItem('token');
    // localStorage.removeItem('user');
    // window.location.href = '/login';
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}
