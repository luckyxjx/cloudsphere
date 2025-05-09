import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { NavItem } from '../App';
import { HomeIcon, KanbanIcon as LayoutKanbanIcon, MessageSquareIcon, VideoIcon, ChevronLeftIcon, ChevronRightIcon, SunIcon, MoonIcon, UserIcon, LogOutIcon, CloudIcon } from 'lucide-react';

interface SidebarProps {
  activeNav: NavItem;
  setActiveNav: (nav: NavItem) => void;
}

function Sidebar({ activeNav, setActiveNav }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'tasks', label: 'Tasks', icon: LayoutKanbanIcon },
    { id: 'chat', label: 'Chat', icon: MessageSquareIcon },
    { id: 'video', label: 'Video', icon: VideoIcon },
  ];

  return (
    <aside 
      className={`flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo and Brand */}
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <CloudIcon className="h-8 w-8 text-blue-500" />
        {!collapsed && (
          <span className="ml-2 text-xl font-semibold">CloudSphere</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveNav(item.id as NavItem)}
                  className={`flex items-center w-full p-2 rounded-lg transition-colors ${
                    activeNav === item.id
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <div className="flex items-center mb-4 space-x-3">
            <div className="relative">
              <UserIcon className="h-8 w-8 p-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            </div>
            <div>
              <p className="font-medium">John Doe</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <SunIcon className="h-5 w-5 text-amber-500" />
                {!collapsed && <span className="ml-3">Light Mode</span>}
              </>
            ) : (
              <>
                <MoonIcon className="h-5 w-5 text-indigo-600" />
                {!collapsed && <span className="ml-3">Dark Mode</span>}
              </>
            )}
          </button>

          {/* Toggle Sidebar */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {collapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeftIcon className="h-5 w-5" />
                <span className="ml-3">Collapse</span>
              </>
            )}
          </button>

          {/* Logout */}
          <button className="flex items-center p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <LogOutIcon className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
