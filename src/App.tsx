import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Thevenin } from './pages/Thevenin';
import { Norton } from './pages/Norton';
import { Learn } from './pages/Learn';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#1a1a1a] text-white selection:bg-yellow-500 selection:text-black">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/thevenin" element={<Thevenin />} />
            <Route path="/norton" element={<Norton />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
