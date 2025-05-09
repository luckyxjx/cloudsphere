import { useState } from 'react';
import { BellIcon, SearchIcon, SettingsIcon, LogOutIcon, UserIcon, ChevronDownIcon } from 'lucide-react';
import { NavItem } from '../App';
import { useAuth } from '../components/context/AuuthContext';

interface HeaderProps {
  activeNav: NavItem;
  onLogout: () => void;
}

function Header({ activeNav, onLogout }: HeaderProps) {
  const [notifications, setNotifications] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useAuth();

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
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-6 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {getTitle()}
        </h1>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white dark:focus-within:bg-gray-600">
            <SearchIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none ml-2 w-40 lg:w-64 text-sm placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
              <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1 -translate-y-1 animate-pulse">
                  {notifications}
                </span>
              )}
            </button>
          </div>
          
          {/* Settings */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <SettingsIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-medium">
                  {user?.name?.charAt(0).toUpperCase() || <UserIcon className="h-5 w-5" />}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</span>
                <ChevronDownIcon className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'transform rotate-180' : ''}`} />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700 transform origin-top-right transition-all duration-200 ease-out">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors duration-200"
                >
                  <LogOutIcon className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;