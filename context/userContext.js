// UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../Utility/firebaseConfig';

// Create context
const UserContext = createContext();

// Custom hook to use user context
export const useUser = () => useContext(UserContext);

// UserProvider component that provides the user state to your app
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store the user state

  useEffect(() => {
    // Listen for auth state changes (e.g., login, logout)
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser); // Store user data in state
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);

  return (
    <UserContext.Provider value={{ user, userId: user?.uid }}>
      {children}
    </UserContext.Provider>
  );
};
