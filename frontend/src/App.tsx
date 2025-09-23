import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
      </div>
    </Router>
  );
}

export default App;