import { use } from 'react';
import { logout, isTokenValid } from './auth';
import { useUserStore } from '../store/UserStore';

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  // 1. Check if token is still valid before even making the call
  if (!isTokenValid()) {
    console.warn("Token expired or missing. Redirecting to login.");
    logout();
    // Optional: window.location.href = '/login';
    throw new Error("Session expired");
  }

  const token = localStorage.getItem('token');

  // 2. Merge headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, { ...options, headers });

  // 3. Handle global errors (like a 401 Unauthorized from the server)
if (response.status === 401) {
    logout(); // Clears localStorage
    
    // Clear the memory state in Zustand
    useUserStore.setState({ user: null, loading: false }); 
    
    window.location.href = '/login';
  }

  return response;
};