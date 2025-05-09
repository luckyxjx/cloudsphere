# CloudSphere Dashboard

A modern, responsive dashboard application built with React, TypeScript, and Tailwind CSS.

## Features

- 🎨 Modern UI with dark mode support
- 📱 Fully responsive design
- 🔐 Authentication system
- 📊 Interactive dashboard
- 📋 Kanban board for task management
- 💬 Real-time chat
- 🎥 Video conferencing with WebRTC
- ✨ Smooth animations and transitions

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Start the backend server (in a separate terminal):
```bash
node server.js
```

The application will be available at `http://localhost:5174`

## Project Structure

```
dashboard/
├── src/
│   ├── components/     # Reusable components
│   ├── context/       # React context providers
│   ├── pages/         # Page components
│   └── App.tsx        # Main application component
├── server.js          # Backend server
└── package.json       # Project dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Socket.IO
- WebRTC
- Vite

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 