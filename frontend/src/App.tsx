// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { Dashboard } from './components/Dashboard';
import { CreateProject } from './components/CreateProject';
import { ProjectWorkspace } from './components/ProjectWorkspace';
import { ChapterEditor } from './components/ChapterEditor';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Routes>
            {/* 公开路由 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* 受保护的路由 */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/create" element={
              <ProtectedRoute>
                <CreateProject />
              </ProtectedRoute>
            } />
            <Route path="/project/:projectId" element={
              <ProtectedRoute>
                <ProjectWorkspace />
              </ProtectedRoute>
            } />
            <Route path="/project/:projectId/edit/:elementId" element={
              <ProtectedRoute>
                <ChapterEditor />
              </ProtectedRoute>
            } />
          </Routes>
          <Analytics />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;