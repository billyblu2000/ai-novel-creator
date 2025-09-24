// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { Dashboard } from './components/Dashboard';
import { CreateProject } from './components/CreateProject';
import { ProjectWorkspace } from './components/ProjectWorkspace';
import { ChapterEditor } from './components/ChapterEditor';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateProject />} />
          <Route path="/project/:projectId" element={<ProjectWorkspace />} />
          <Route path="/project/:projectId/edit/:elementId" element={<ChapterEditor />} />
        </Routes>
        <Analytics />
      </div>
    </Router>
  );
}

export default App;