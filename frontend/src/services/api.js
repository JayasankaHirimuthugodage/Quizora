// API service pointing to port 5001
const API_BASE_URL = 'http://localhost:5001/api';

console.log('API Base URL:', API_BASE_URL);

class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
    console.log('ApiService initialized with base URL:', baseURL);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    console.log('Making request to:', url);
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      console.log('Sending fetch request...');
      const response = await fetch(url, config);
      
      console.log('Response status:', response.status);
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText || `HTTP error! status: ${response.status}` };
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Success response data:', data);
      return data;
      
    } catch (error) {
      console.error('Fetch error details:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running on http://localhost:5001');
      }
      
      throw error;
    }
  }

  get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params);
    const url = searchParams.toString() ? `${endpoint}?${searchParams}` : endpoint;
    return this.request(url);
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

const api = new ApiService(API_BASE_URL);

// Test the connection immediately
api.get('/health')
  .then(response => {
    console.log('Backend connection test successful:', response);
  })
  .catch(error => {
    console.error('Backend connection test failed:', error.message);
  });

export default api;