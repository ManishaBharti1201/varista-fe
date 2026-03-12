import { use } from 'react';
import { logout, isTokenValid } from './auth';
import { useUserStore } from '../store/UserStore';

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  if (!isTokenValid()) {
    logout();
    window.location.href = '/login';
    throw new Error("Session expired");
  }

  const token = localStorage.getItem('token');

  // 1. Initialize headers
  const headers: Record<string, string> = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  // 2. CRITICAL FIX: 
  // If the body is FormData, DO NOT set Content-Type. 
  // The browser will set it automatically with the correct boundary.
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    logout();
    useUserStore.setState({ user: null, loading: false }); 
    window.location.href = '/login';
  }

  return response;
};