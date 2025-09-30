import React, { useEffect, useState } from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';

interface TitleBarProps {
  title?: string;
  showControls?: boolean;
}

declare global {
  interface Window {
    electronAPI?: {
      minimizeWindow: () => Promise<void>;
      maximizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
      platform: string;
      isMac: boolean;
      isWindows: boolean;
      isLinux: boolean;
    };
  }
}

const TitleBar: React.FC<TitleBarProps> = ({ 
  title = 'CloudSphere Dashboard',
  showControls = true 
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    const api = window.electronAPI;
    setIsElectron(!!api);
    setIsMac(Boolean(api?.isMac));
  }, []);

  const handleMinimize = async () => {
    if (window.electronAPI) {
      await window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = async () => {
    if (window.electronAPI) {
      await window.electronAPI.maximizeWindow();
      setIsMaximized(!isMaximized);
    }
  };

  const handleClose = async () => {
    if (window.electronAPI) {
      await window.electronAPI.closeWindow();
    }
  };

  // On macOS, use native traffic lights and no custom title bar
  if (!isElectron || isMac || !showControls) {
    return null;
  }

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-12 bg-gray-900 border-b border-gray-700 z-50 flex items-center justify-between px-4 select-none"
      style={{ WebkitAppRegion: 'drag' }}
    >
      {/* App Title */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">CS</span>
        </div>
        <span className="text-white font-medium">{title}</span>
      </div>

      {/* Window Controls (Windows/Linux only) */}
      <div 
        className="flex items-center space-x-1"
        style={{ WebkitAppRegion: 'no-drag' }}
      >
        <button
          onClick={handleMinimize}
          className="w-12 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-200"
          aria-label="Minimize"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={handleMaximize}
          className="w-12 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-200"
          aria-label="Maximize"
        >
          {isMaximized ? <Square size={14} /> : <Maximize2 size={14} />}
        </button>
        <button
          onClick={handleClose}
          className="w-12 h-8 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-colors duration-200"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;

