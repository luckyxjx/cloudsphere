import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import ChatApp from './pages/ChatApp';
import VideoCall from './pages/VideoCall';

// Navigation types
export type NavItem = 'dashboard' | 'tasks' | 'chat' | 'video';

function App() {
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
        return <VideoCall />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <AppLayout activeNav={activeNav} setActiveNav={setActiveNav}>
        {renderContent()}
      </AppLayout>
    </ThemeProvider>
  );
}

export default App;