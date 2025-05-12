import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueueProvider } from './context/QueueContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import TellerPage from './pages/TellerPage';
import AdminPage from './pages/AdminPage';
import FeedbackPage from './pages/FeedbackPage';

function App() {
  return (
    <QueueProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow bg-bkNeutral-100">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/teller" element={<TellerPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </QueueProvider>
  );
}

export default App;