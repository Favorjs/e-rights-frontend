# Rights Issue Web App - Client

This is the frontend React application for the Rights Issue Web Application.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Copy `.env.example` to `.env` and update the values if needed:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Client

### Development
```bash
npm start
```
This will start the development server at `http://localhost:3000`.

### Production Build
```bash
npm run build
```
This will create an optimized production build in the `build` folder.

## Environment Variables

- `REACT_APP_API_URL` - The base URL of the API server (default: `http://localhost:5000`)
- `NODE_ENV` - Environment (development/production)

## Project Structure

- `public/` - Static files
- `src/` - Source code
  - `components/` - Reusable UI components
  - `pages/` - Page components
  - `services/` - API services
  - `App.js` - Main application component
  - `index.js` - Application entry point
