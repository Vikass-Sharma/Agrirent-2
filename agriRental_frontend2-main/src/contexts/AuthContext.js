import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the authentication context - central store for user auth state
const AuthContext = createContext();

// Custom hook to access authentication context from any component
// Throws error if used outside AuthProvider to prevent bugs
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component that wraps the app and manages authentication state
export const AuthProvider = ({ children }) => {
  // Current logged-in user data (null if not logged in)
  const [user, setUser] = useState(null);
  // Loading state for initial app startup
  const [loading, setLoading] = useState(true);

  // On component mount, check if user was previously logged in
  // This maintains login state across browser sessions
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      // Restore user from localStorage if found
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // App is ready to render
  }, []);

  // Login function - saves user data to state and localStorage
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout function - clears user data from state and localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Value object containing all auth data and functions
  // This is what components get when they call useAuth()
  const value = {
    user,                                    // Current user object
    login,                                   // Function to log in a user
    logout,                                  // Function to log out current user
    loading,                                 // Boolean: is app still loading?
    isAuthenticated: !!user,                 // Boolean: is someone logged in?
    isAdmin: user?.role === 'admin',         // Boolean: is current user an admin?
    isOwner: user?.role === 'owner',         // Boolean: is current user an equipment owner?
    isUser: user?.role === 'user'            // Boolean: is current user a regular user?
  };

  // Provide the authentication context to all child components
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
