import { useState } from 'react';
import { useTheme } from './context/ThemeContext';
import { NavItem } from '../App';
import { HomeIcon, KanbanIcon as LayoutKanbanIcon, MessageSquareIcon, VideoIcon, ChevronLeftIcon, ChevronRightIcon, SunIcon, MoonIcon, UserIcon, LogOutIcon, CloudIcon } from 'lucide-react';

interface SidebarProps {
  activeNav: NavItem;
  setActiveNav: (nav: NavItem) => void;
}

function Sidebar({ activeNav, setActiveNav }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Navigation items
  const navItems = [
    { id: 'dashboard' as NavItem, icon: HomeIcon, label: 'Dashboard' },
    { id: 'tasks' as NavItem, icon: LayoutKanbanIcon, label: 'Tasks' },
    { id: 'chat' as NavItem, icon: MessageSquareIcon, label: 'Chat' },
    { id: 'video' as NavItem, icon: VideoIcon, label: 'Video' },
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <CloudIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <span className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">CloudSphere</span>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {isCollapsed ? (
                <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                activeNav === item.id
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <item.icon className={`h-5 w-5 ${activeNav === item.id ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
              {!isCollapsed && (
                <span className={`font-medium ${activeNav === item.id ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-600 dark:text-gray-300"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
            {!isCollapsed && <span className="font-medium">Toggle Theme</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
