import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem('userInfo') ||
        localStorage.getItem('workspace_profile');

      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('authToken') ||
        localStorage.getItem('accessToken');

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } else if (token) {
        setUser({
          authenticated: true,
        });
      }
    } catch (error) {
      console.error('Auth restore error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, token = null) => {
    setUser(userData);

    localStorage.setItem(
      'userInfo',
      JSON.stringify(userData)
    );

    localStorage.setItem(
      'workspace_profile',
      JSON.stringify(userData)
    );

    localStorage.setItem('isLoggedIn', 'true');

    if (token) {
      localStorage.setItem('token', token);
    }
  };

  const logout = () => {
    setUser(null);

    localStorage.removeItem('userInfo');
    localStorage.removeItem('workspace_profile');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('isLoggedIn');

    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;