import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/context/ThemeContext';
import { AuthProvider, useAuth } from './components/context/AuuthContext';
import AppLayout from './components/context/layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import ChatApp from './pages/ChatApp';
import VideoCall from './pages/VideoCall';
import Login from './pages/login';

// Navigation types
export type NavItem = 'dashboard' | 'tasks' | 'chat' | 'video';

function ProtectedApp() {
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard');

  // Render the active content based on navigation selection
  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <KanbanBoard />;
      case 'chat':
        return <ChatApp />;
      case 'video':
        return <Navigate to="/video" replace />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppLayout activeNav={activeNav} setActiveNav={setActiveNav}>
      {renderContent()}
    </AppLayout>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
      <Route
        path="/"
        element={isAuthenticated ? <ProtectedApp /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/video"
        element={isAuthenticated ? <VideoCall /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/video/:roomId"
        element={isAuthenticated ? <VideoCall /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/*"
        element={isAuthenticated ? <ProtectedApp /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;