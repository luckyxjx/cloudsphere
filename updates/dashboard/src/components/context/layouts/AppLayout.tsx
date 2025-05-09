import { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { NavItem } from '../App';

interface AppLayoutProps {
  children: ReactNode;
  activeNav: NavItem;
  setActiveNav: (nav: NavItem) => void;
}

function AppLayout({ children, activeNav, setActiveNav }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header activeNav={activeNav} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
