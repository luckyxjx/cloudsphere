import { useState } from 'react';
import { BellIcon, SearchIcon, SettingsIcon } from 'lucide-react';
import { NavItem } from '../App';

interface HeaderProps {
  activeNav: NavItem;
}

function Header({ activeNav }: HeaderProps) {
  const [notifications, setNotifications] = useState(3);

  // Get title based on active navigation
  const getTitle = () => {
    switch (activeNav) {
      case 'dashboard':
        return 'Dashboard';
      case 'tasks':
        return 'Task Management';
      case 'chat':
        return 'Chat';
      case 'video':
        return 'Video Calls';
      default:
        return 'CloudSphere';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{getTitle()}</h1>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
            <SearchIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none ml-2 w-40 lg:w-64"
            />
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <BellIcon className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
                  {notifications}
                </span>
              )}
            </button>
          </div>
          
          {/* Settings */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <SettingsIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
