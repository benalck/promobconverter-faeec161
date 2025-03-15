
import axios from 'axios';

// Base URL for Xano API
const XANO_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:XD-tclLx";

// Create an Axios instance for Xano
export const xanoApi = axios.create({
  baseURL: XANO_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add authentication token to requests if available
xanoApi.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication functions
export const xanoAuth = {
  // Register a new user
  signUp: async (email: string, password: string, userData: any) => {
    try {
      const response = await xanoApi.post('/auth/signup', {
        email,
        password,
        ...userData
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Sign in a user
  signIn: async (email: string, password: string) => {
    try {
      const response = await xanoApi.post('/auth/login', {
        email,
        password
      });
      
      // Store the auth token
      if (response.data.authToken) {
        localStorage.setItem('authToken', response.data.authToken);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Sign out the current user
  signOut: async () => {
    try {
      // Remove auth token from storage
      localStorage.removeItem('authToken');
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Get the current user session
  getSession: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return { data: { session: null } };
    
    try {
      const response = await xanoApi.get('/auth/me');
      return { data: { session: { user: response.data } } };
    } catch (error) {
      localStorage.removeItem('authToken');
      return { data: { session: null } };
    }
  },
  
  // Update user profile
  updateProfile: async (userId: string, updates: any) => {
    try {
      const response = await xanoApi.put(`/users/${userId}`, updates);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
