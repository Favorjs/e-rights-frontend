import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import ShareholderDetailsPage from './pages/ShareholderDetailsPage';
import DigitalFormPage from './pages/DigitalFormPage';
import FormSubmissionPage from './pages/FormSubmissionPage';
import RightsSubmissionDetailsPage from './pages/RightsSubmissionDetailsPage';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search-results" element={<SearchResultsPage />} />
            <Route path="/shareholder/:id" element={<ShareholderDetailsPage />} />
            <Route path="/digital-form/:shareholderId" element={<DigitalFormPage />} />
            <Route path="/form-submission/:id" element={<FormSubmissionPage />} />
            <Route path="/admin/rights-submission/:id" element={<RightsSubmissionDetailsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
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