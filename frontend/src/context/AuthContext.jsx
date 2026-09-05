import React, {
  createContext,
  useEffect,
  useState,
} from 'react';

import axios from 'axios';

export const AuthContext =
  createContext(null);

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  /*
   * -----------------------------------------
   * RESTORE LOGIN AFTER REFRESH
   * -----------------------------------------
   */
  useEffect(() => {
    const restoreUser = async () => {
      try {
        const token =
          localStorage.getItem(
            'token'
          );

        const savedUser =
          localStorage.getItem(
            'user'
          );

        /*
         * No token = not logged in
         */
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        /*
         * If complete user data already
         * exists, restore immediately.
         */
        if (savedUser) {
          try {
            const parsedUser =
              JSON.parse(savedUser);

            if (parsedUser) {
              setUser(parsedUser);
            }
          } catch {
            localStorage.removeItem(
              'user'
            );
          }
        }

        /*
         * Verify token with backend
         * if your backend has /auth/me.
         */
        try {
          const response =
            await axios.get(
              `${API_URL}/auth/me`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          if (
            response.data?.user
          ) {
            setUser(
              response.data.user
            );

            localStorage.setItem(
              'user',
              JSON.stringify(
                response.data.user
              )
            );
          }
        } catch (error) {
          /*
           * Don't immediately log the user
           * out if the saved user exists.
           *
           * This also prevents a temporary
           * network issue from destroying
           * the local login session.
           */
          console.warn(
            'User verification failed:',
            error
          );
        }
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  /*
   * -----------------------------------------
   * LOGIN
   * -----------------------------------------
   */
  const login = (
    token,
    userData
  ) => {
    localStorage.setItem(
      'token',
      token
    );

    localStorage.setItem(
      'user',
      JSON.stringify(userData)
    );

    /*
     * Compatibility with your existing
     * project code.
     */
    localStorage.setItem(
      'isLoggedIn',
      'true'
    );

    if (userData?.email) {
      localStorage.setItem(
        'userEmail',
        userData.email
      );
    }

    if (userData?.name) {
      localStorage.setItem(
        'userName',
        userData.name
      );
    }

    setUser(userData);
  };

  /*
   * -----------------------------------------
   * LOGOUT
   * -----------------------------------------
   */
  const logout = () => {
    localStorage.removeItem(
      'token'
    );

    localStorage.removeItem(
      'user'
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

    setUser(null);
  };

  /*
   * -----------------------------------------
   * CONTEXT
   * -----------------------------------------
   */
  const value = {
    user,
    setUser,
    login,
    logout,
    loading,
    isAuthenticated:
      Boolean(user) ||
      Boolean(
        localStorage.getItem(
          'token'
        )
      ),
  };

  /*
   * Don't show protected pages while
   * login state is being restored.
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
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;