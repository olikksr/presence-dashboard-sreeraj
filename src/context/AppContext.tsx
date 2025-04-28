import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type ThemeType = 'light' | 'dark';

interface OfficeLocation {
  latitude: number;
  longitude: number;
  radius: number;
}

type AppContextType = {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  appName: string;
  username: string;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  theme: ThemeType;
  toggleTheme: () => void;
  officeLocation: OfficeLocation | null;
  updateOfficeLocation: (location: OfficeLocation) => void;
  googleMapsApiKey: string;
  setGoogleMapsApiKey: (key: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [theme, setTheme] = useState<ThemeType>('light');
  const [officeLocation, setOfficeLocation] = useState<OfficeLocation | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  const appName = 'Presence';

  // Load authentication state from localStorage on component mount
  useEffect(() => {
    const storedAuthState = localStorage.getItem('authState');
    if (storedAuthState) {
      try {
        const { isLoggedIn: storedIsLoggedIn, username: storedUsername } = JSON.parse(storedAuthState);
        setIsLoggedIn(storedIsLoggedIn);
        setUsername(storedUsername || '');
      } catch (error) {
        console.error('Error parsing stored auth state:', error);
        localStorage.removeItem('authState');
      }
    }

    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme);
    }

    const storedLocation = localStorage.getItem('officeLocation');
    if (storedLocation) {
      try {
        setOfficeLocation(JSON.parse(storedLocation));
      } catch (error) {
        console.error('Error parsing stored location:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const toggleTheme = () => {
    setTheme(current => (current === 'light' ? 'dark' : 'light'));
  };

  const updateOfficeLocation = (location: OfficeLocation) => {
    setOfficeLocation(location);
    localStorage.setItem('officeLocation', JSON.stringify(location));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5001/api/company/login', {   // change if backend is hosted elsewhere
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.status === 200 && data.data) {
        const userInfo = data.data; // backend returns company object
        setIsLoggedIn(true);
        setUsername(userInfo.adminName || userInfo.adminEmail || 'User');
  
        localStorage.setItem('authState', JSON.stringify({
          isLoggedIn: true,
          username: userInfo.adminName || userInfo.adminEmail || 'User',
          email: userInfo.adminEmail,
          companyId: userInfo.id,    // ✅ VERY IMPORTANT - Save companyId here
        }));
  
        return true;
      } else {
        console.error('Login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  

  const logout = () => {
    setIsLoggedIn(false);
    setUsername('');
    localStorage.removeItem('authState');
  };

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        currentPage,
        setCurrentPage,
        appName,
        username,
        isLoggedIn,
        login,
        logout,
        theme,
        toggleTheme,
        officeLocation,
        updateOfficeLocation,
        googleMapsApiKey,
        setGoogleMapsApiKey,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
