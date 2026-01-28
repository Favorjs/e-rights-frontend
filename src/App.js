import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import ShareholderDetailsPage from './pages/ShareholderDetailsPage';
import DigitalFormPage from './pages/DigitalFormPage';
import FormSubmissionPage from './pages/FormSubmissionPage';
import RightsSubmissionDetailsPage from './pages/RightsSubmissionDetailsPage';
import AdminDashboard from './pages/AdminDashboard';
import RightsClosedPage from './pages/RightsClosedPage';
import './App.css';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import { APP_CONFIG } from './config/appConfig';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const isClosed = APP_CONFIG.IS_RIGHTS_ISSUE_CLOSED;

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50 flex flex-col">
        {!isClosed && <Header />}
        <main className="flex-grow">
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/rights-submission/:id"
              element={
                <ProtectedRoute>
                  <RightsSubmissionDetailsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Public Routes */}
            {isClosed ? (
              <Route path="*" element={<RightsClosedPage />} />
            ) : (
              <React.Fragment>
                <Route path="/" element={<HomePage />} />
                <Route path="/search-results" element={<SearchResultsPage />} />
                <Route path="/shareholder/:id" element={<ShareholderDetailsPage />} />
                <Route path="/digital-form/:id" element={<DigitalFormPage />} />
                <Route path="/form-submission/:id" element={<FormSubmissionPage />} />
                <Route path="*" element={<HomePage />} />
              </React.Fragment>
            )}
          </Routes>
        </main>
        {!isClosed && <Footer />}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App; 