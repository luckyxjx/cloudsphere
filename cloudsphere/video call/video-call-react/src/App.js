import React, { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import VideoCall from './components/VideoCall';
import { GlobalStyle, lightTheme, darkTheme } from './styles/GlobalStyle';
import '@fortawesome/fontawesome-free/css/all.min.css';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 100vw;
  overflow: hidden;
`;

const Header = styled.header`
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${props => props.theme.surface};
  border-bottom: 1px solid ${props => props.theme.border};
  height: 60px;
  flex-shrink: 0;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, ${props => props.theme.primary}, ${props => props.theme.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 0.75rem;
  color: ${props => props.theme.text};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;

  &:hover {
    border-color: ${props => props.theme.primary};
    transform: translateY(-2px);
  }
`;

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    return savedTheme === 'dark' ? darkTheme : lightTheme;
  });

  const toggleTheme = () => {
    const newTheme = theme === darkTheme ? lightTheme : darkTheme;
    setTheme(newTheme);
    localStorage.setItem('theme', theme === darkTheme ? 'light' : 'dark');
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <Logo>Cloudsphere</Logo>
          <ThemeToggle onClick={toggleTheme}>
            <i className={`fas fa-${theme === darkTheme ? 'moon' : 'sun'}`}></i>
            <span>{theme === darkTheme ? 'Dark Mode' : 'Light Mode'}</span>
          </ThemeToggle>
        </Header>
        <VideoCall />
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
