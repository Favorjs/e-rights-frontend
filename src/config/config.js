// Environment Configuration
const config = {
  development: {
    apiUrl: 'http://localhost:5000',
    environment: 'development'
  },
  production: {
    apiUrl: 'https://api.tip.apel.com.ng', // Replace with your actual Railway URL
    environment: 'production'
  }
};

// Get current environment
const currentEnv = process.env.NODE_ENV || 'development';

// Export current config
export const currentConfig = config[currentEnv] || config.development;

// Export all configs
export default config;
