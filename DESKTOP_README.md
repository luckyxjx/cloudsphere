# 🖥️ CloudSphere Dashboard Desktop App

Transform your web-based CloudSphere Dashboard into a native desktop application using Electron!

## ✨ Features

- **Native Desktop Experience** - Looks and feels like a real desktop app
- **Cross-Platform** - Works on Windows, macOS, and Linux
- **Custom Titlebar** - Native window controls with app branding
- **Menu Integration** - Full application menu with shortcuts
- **Auto-updates** - Built-in update mechanism
- **Offline Capability** - Works without internet connection
- **System Integration** - Dock/taskbar integration, notifications

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies including Electron
npm run install:all
```

### 2. Launch Desktop App

```bash
# Quick launch (recommended)
./desktop.sh

# Or use npm scripts
npm run desktop
npm run desktop:dev
```

### 3. Build Desktop App

```bash
# Build for current platform
npm run desktop:build

# Build for specific platform
npm run desktop:dist:mac      # macOS (.dmg, .zip)
npm run desktop:dist:win      # Windows (.exe, .msi)
npm run desktop:dist:linux    # Linux (.AppImage, .deb)
```

## 🎯 Usage Options

### Development Mode
```bash
npm run desktop:dev
```
- Starts both Vite dev server and Electron
- Hot reload enabled
- DevTools open automatically
- Connects to local backend

### Production Mode
```bash
npm run desktop:build
npm run desktop:dist
```
- Builds optimized production app
- Creates distributable packages
- Ready for deployment

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Main Process                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Window Mgmt   │  │   Menu System   │  │   IPC API   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Electron Renderer Process                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              React Application (Vite)                  │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │ │
│  │  │   TitleBar  │  │   Dashboard │  │   Components    │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📱 Platform-Specific Features

### macOS
- **Dock Integration** - App appears in dock with custom icon
- **Menu Bar** - Native macOS menu bar integration
- **Window Controls** - Traffic light buttons (red, yellow, green)
- **Touch Bar** - Touch Bar support for MacBook Pro
- **Dark Mode** - Automatic dark/light mode switching

### Windows
- **Taskbar Integration** - App appears in Windows taskbar
- **Start Menu** - Windows Start menu integration
- **Window Controls** - Minimize, maximize, close buttons
- **System Tray** - Optional system tray icon
- **Windows Store** - Ready for Microsoft Store deployment

### Linux
- **App Launcher** - Integration with GNOME/KDE app launchers
- **System Menu** - Native Linux system menu integration
- **Window Manager** - Works with all major window managers
- **Package Managers** - .deb, .rpm, .AppImage support

## 🎨 Customization

### Titlebar Styling
The custom titlebar can be styled by modifying `src/components/TitleBar.tsx`:

```tsx
// Custom colors
className="bg-gradient-to-r from-blue-600 to-purple-600"

// Custom icons
icon={<CustomIcon className="w-6 h-6" />}

// Platform-specific styling
className={`${isMac ? 'mac-style' : 'windows-style'}`}
```

### Menu Customization
Edit `electron/main.js` to customize the application menu:

```javascript
{
  label: 'Custom Menu',
  submenu: [
    {
      label: 'Custom Action',
      accelerator: 'CmdOrCtrl+Shift+A',
      click: () => {
        // Your custom action
      }
    }
  ]
}
```

### App Icon
Replace the icon files in `build/` directory:
- **macOS**: `icon.icns` (512x512)
- **Windows**: `icon.ico` (256x256)
- **Linux**: `icon.png` (512x512)

## 🔧 Configuration

### Environment Variables
```bash
# Desktop app specific
ELECTRON_START_URL=http://localhost:5173
ELECTRON_DEV_TOOLS=true
ELECTRON_RELOAD_ON_CHANGE=true
```

### Build Configuration
Edit `package.json` build section:

```json
{
  "build": {
    "appId": "com.yourcompany.appname",
    "productName": "Your App Name",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ]
  }
}
```

## 📦 Distribution

### Creating Installers

```bash
# macOS
npm run desktop:dist:mac
# Creates: .dmg and .zip files

# Windows
npm run desktop:dist:win
# Creates: .exe installer and portable .exe

# Linux
npm run desktop:dist:linux
# Creates: .AppImage and .deb packages
```

### Code Signing
For production distribution, configure code signing:

```json
{
  "build": {
    "mac": {
      "identity": "Your Developer ID"
    },
    "win": {
      "certificateFile": "path/to/certificate.p12",
      "certificatePassword": "password"
    }
  }
}
```

### Auto-updates
Configure auto-updates in your main process:

```javascript
import { autoUpdater } from 'electron-updater';

autoUpdater.checkForUpdatesAndNotify();
```

## 🧪 Testing

### Unit Tests
```bash
# Test React components
npm run test:client

# Test with coverage
npm run test:client -- --coverage
```

### E2E Tests
```bash
# Using Playwright or similar
npm run test:e2e
```

### Manual Testing
```bash
# Test different platforms
npm run desktop:dist:mac
npm run desktop:dist:win
npm run desktop:dist:linux
```

## 🚨 Troubleshooting

### Common Issues

1. **App won't start**
   ```bash
   # Check dependencies
   npm install
   
   # Clear Electron cache
   rm -rf ~/Library/Application\ Support/CloudSphere\ Dashboard
   ```

2. **Build fails**
   ```bash
   # Clean build artifacts
   npm run clean
   
   # Reinstall dependencies
   rm -rf node_modules && npm install
   ```

3. **Performance issues**
   - Enable hardware acceleration
   - Disable DevTools in production
   - Optimize bundle size

### Debug Mode
```bash
# Enable debug logging
DEBUG=electron-* npm run desktop:dev

# Open DevTools manually
Cmd+Option+I (macOS) or Ctrl+Shift+I (Windows/Linux)
```

## 🔒 Security

### Best Practices
- **Context Isolation**: Enabled by default
- **Node Integration**: Disabled for security
- **Remote Content**: Restricted to trusted sources
- **Sandboxing**: Enabled where possible

### CSP Headers
```javascript
// Content Security Policy
webPreferences: {
  contextIsolation: true,
  enableRemoteModule: false,
  nodeIntegration: false
}
```

## 📚 Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Builder](https://www.electron.build/)
- [Vite + Electron](https://vitejs.dev/guide/backend-integration.html#electron)
- [React + Electron](https://github.com/electron-react-boilerplate/electron-react-boilerplate)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on all platforms
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Transform your web app into a native desktop experience with CloudSphere Dashboard! 🚀**

