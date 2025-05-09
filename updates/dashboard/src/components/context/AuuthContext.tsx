import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize with null and clear any existing user data
  const [user, setUser] = useState<User | null>(null);

  // Clear any existing user data on mount
  useEffect(() => {
    localStorage.removeItem('user');
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // TODO: Implement actual API call to your backend
      // This is a mock implementation
      const mockUser = {
        id: '1',
        email,
        name: 'Test User',
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      // TODO: Implement actual API call to your backend
      // This is a mock implementation
      const mockUser = {
        id: '1',
        email,
        name,
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Signup failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 