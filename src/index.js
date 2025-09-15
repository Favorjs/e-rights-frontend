import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Add error boundary for production
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('React Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Application Error - Please Refresh</h1>;
    }
    return this.props.children;
  }
}

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Improved Service Worker Registration
const registerServiceWorker = async () => {
  // Only register in production and if service workers are supported
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      // Check if we're in a supported environment
      if (!window.isSecureContext) {
        console.warn('Service workers require HTTPS');
        return;
      }

      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none' // Important for updates
      });
      
      console.log('ServiceWorker registration successful with scope: ', registration.scope);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('New service worker found:', newWorker);
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            console.log('New service worker installed');
          }
        });
      });

    } catch (error) {
      console.warn('ServiceWorker registration failed: ', error);
      
      // Clean up any existing problematic service workers
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('Unregistered existing service worker');
        }
      } catch (unregisterError) {
        console.error('Failed to unregister service workers:', unregisterError);
      }
    }
  }
};

// Register service worker after page load
if (process.env.NODE_ENV === 'production') {
  window.addEventListener('load', registerServiceWorker);
}