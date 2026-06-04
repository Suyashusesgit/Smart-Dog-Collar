import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TacticalDashboard from './pages/TacticalDashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<TacticalDashboard />} />
      </Routes>
    </Router>
  );
}
