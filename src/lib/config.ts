// API Configuration
// This file handles the API base URL for different environments
// Updated for Azure backend deployment

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Production environment (GitHub Pages)
    if (hostname.includes('github.io')) {
      // Azure backend URL
      return 'https://neel-ai-analytics-backend.azurewebsites.net';
    }

    // GitHub Codespaces development environment
    if (hostname.includes('github.dev')) {
      const codespace = hostname.split('.')[0];
      return `https://${codespace}-8000.app.github.dev`;
    }

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    } else {
      // LAN access (mobile devices)
      return 'http://192.168.1.33:8000';
    }
  }

  // Server-side rendering fallback (Azure backend)
  return 'https://neel-ai-analytics-backend.azurewebsites.net';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to construct API URLs
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Export for use in components
const config = {
  API_BASE_URL,
  getApiUrl,
};

export default config;
