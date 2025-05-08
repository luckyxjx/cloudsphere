import { createGlobalStyle } from 'styled-components';

export const lightTheme = {
  primary: '#7C3AED',
  primaryDark: '#6D28D9',
  secondary: '#10B981',
  accent: '#F59E0B',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  danger: '#EF4444',
  success: '#10B981',
  border: '#E2E8F0'
};

export const darkTheme = {
  primary: '#7C3AED',
  primaryDark: '#6D28D9',
  secondary: '#10B981',
  accent: '#F59E0B',
  background: '#0F172A',
  surface: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  danger: '#EF4444',
  success: '#10B981',
  border: '#334155'
};

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Space Grotesk', sans-serif;
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
    line-height: 1.5;
    margin: 0;
    padding: 0;
    height: 100vh;
    overflow: hidden;
    background-image: 
      radial-gradient(circle at 10% 20%, rgba(124, 58, 237, 0.1) 0%, transparent 20%),
      radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 20%);
  }

  button {
    font-family: 'Space Grotesk', sans-serif;
  }

  input {
    font-family: 'Space Grotesk', sans-serif;
  }
`; 