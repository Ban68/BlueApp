
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Market from './pages/Market';
import Technical from './pages/Technical';
import FarmVisit from './pages/FarmVisit';
import Business from './pages/Business';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/market" element={<Market />} />
          <Route path="/technical" element={<Technical />} />
          <Route path="/visit" element={<FarmVisit />} />
          <Route path="/business" element={<Business />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
