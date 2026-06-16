import React, { createContext, useState, useContext, useEffect } from 'react';
import { localStorageAPI, isLocalMode } from '../services/localStorageService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const currentUser = localStorageAPI.getCurrentUser();
    if (currentUser && localStorageAPI.isLoggedIn()) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await localStorageAPI.login(email, password);
      setUser(res.user);
      return res;
    } catch (err) {
      throw err;
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await localStorageAPI.register(username, email, password);
      setUser(res.user);
      return res;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorageAPI.logout();
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      const updatedUser = await localStorageAPI.updateProfile(user.id, userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      updateProfile, 
      loading,
      isLocalMode 
    }}>
      {children}
    </AuthContext.Provider>
  );
};