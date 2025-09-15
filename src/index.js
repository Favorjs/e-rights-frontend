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

// Service Worker Registration (if available)
// Service Worker Registration - Simplified
// if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.js')
//       .then((registration) => {
//         console.log('SW registered for scope:', registration.scope);
//       })
//       .catch((error) => {
//         console.log('SW registration failed:', error);
//       });
//   });
// }

// // Only register service worker if the file exists
// if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
//   window.addEventListener('load', registerServiceWorker);
// }