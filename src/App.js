import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { initGA, trackPageView } from './utils/analytics';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';
import Services from './components/Services';
import Contact from './components/Contact';
import MandirNirmaanSeva from './components/MandirNirmaanSeva';
import ConstructionImagesGallery from './components/ConstructionImagesGallery';
import DonorList from './components/DonorList';
import Donate from './components/Donate';
import DailyPuja from './components/DailyPuja';
import SpecialEvents from './components/SpecialEvents';
import SevaBooking from './components/SevaBooking';
import PrasadDistribution from './components/PrasadDistribution';
import MorningAartiPage from './components/services/MorningAartiPage';
import SpecialPujaPage from './components/services/SpecialPujaPage';
import AbhishekamPage from './components/services/AbhishekamPage';
import FlowerOfferingPage from './components/services/FlowerOfferingPage';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminDonations from './components/admin/AdminDonations';
import AdminDonationConfirmations from './components/admin/AdminDonationConfirmations';
import AdminUpdates from './components/admin/AdminUpdates';
import AdminExpenses from './components/admin/AdminExpenses';
import AdminEvents from './components/admin/AdminEvents';
import AdminTeamMembers from './components/admin/AdminTeamMembers';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

// Component to track page views on route changes
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location]);

  return null;
}

function App() {
  useEffect(() => {
    // Initialize Google Analytics with your Measurement ID
    // Get this from .env or use directly
    const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;
    if (measurementId) {
      initGA(measurementId);
    } else {
      console.warn('Google Analytics Measurement ID not set. Add REACT_APP_GA_MEASUREMENT_ID to .env file');
    }
  }, []);

  return (
    <LanguageProvider>
      <BrowserRouter>
        <AnalyticsTracker />
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/mandir-nirmaan-seva" element={<MandirNirmaanSeva />} />
              <Route path="/mandir-nirmaan-seva/images" element={<ConstructionImagesGallery />} />
              <Route path="/donor-list" element={<DonorList />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/daily-puja" element={<DailyPuja />} />
              <Route path="/special-events" element={<SpecialEvents />} />
              <Route path="/seva-booking" element={<SevaBooking />} />
              <Route path="/prasad-distribution" element={<PrasadDistribution />} />
              <Route path="/services/morning-aarti" element={<MorningAartiPage />} />
              <Route path="/services/special-puja" element={<SpecialPujaPage />} />
              <Route path="/services/abhishekam" element={<AbhishekamPage />} />
              <Route path="/services/flower-offering" element={<FlowerOfferingPage />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
              <Route path="/admin/donations" element={<PrivateRoute><AdminDonations /></PrivateRoute>} />
              <Route path="/admin/donation-confirmations" element={<PrivateRoute><AdminDonationConfirmations /></PrivateRoute>} />
              <Route path="/admin/updates" element={<PrivateRoute><AdminUpdates /></PrivateRoute>} />
              <Route path="/admin/expenses" element={<PrivateRoute><AdminExpenses /></PrivateRoute>} />
              <Route path="/admin/events" element={<PrivateRoute><AdminEvents /></PrivateRoute>} />
              <Route path="/admin/team-members" element={<PrivateRoute><AdminTeamMembers /></PrivateRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
