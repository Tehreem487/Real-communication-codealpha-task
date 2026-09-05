import React, {
  createContext,
  useEffect,
  useState,
} from 'react';

export const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  /*
   * -----------------------------------------
   * RESTORE LOGIN SESSION
   * -----------------------------------------
   */
  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem(
          'userInfo'
        );

      const isLoggedIn =
        localStorage.getItem(
          'isLoggedIn'
        );

      if (
        savedUser &&
        isLoggedIn === 'true'
      ) {
        const parsedUser =
          JSON.parse(savedUser);

        setUser(parsedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error(
        'Session restore error:',
        error
      );

      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * -----------------------------------------
   * LOGIN
   * -----------------------------------------
   */
  const login = (
    userData
  ) => {
    localStorage.setItem(
      'userInfo',
      JSON.stringify(userData)
    );

    localStorage.setItem(
      'workspace_profile',
      JSON.stringify(userData)
    );

    localStorage.setItem(
      'isLoggedIn',
      'true'
    );

    localStorage.setItem(
      'userEmail',
      userData?.email || ''
    );

    localStorage.setItem(
      'userName',
      userData?.name ||
        userData?.username ||
        'User'
    );

    setUser(userData);
  };

  /*
   * -----------------------------------------
   * LOGOUT
   * -----------------------------------------
   */
  const logout = () => {
    localStorage.removeItem(
      'userInfo'
    );

    localStorage.removeItem(
      'workspace_profile'
    );

    localStorage.removeItem(
      'isLoggedIn'
    );

    localStorage.removeItem(
      'userEmail'
    );

    localStorage.removeItem(
      'userName'
    );

    localStorage.removeItem(
      'token'
    );

    setUser(null);
  };

  /*
   * -----------------------------------------
   * LOADING
   * -----------------------------------------
   */
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#fff',
          fontFamily:
            'system-ui, sans-serif',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
        isAuthenticated:
          Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;