// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { Dashboard } from './components/Dashboard';
import { ProjectWorkspace } from './components/ProjectWorkspace';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/project/:projectId/*" element={<ProjectWorkspace />} />
        </Routes>
        <Analytics />
      </div>
    </Router>
  );
}

export default App;