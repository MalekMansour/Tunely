import React, { createContext, useContext, useState, useEffect } from "react";
import { themes } from "../constants/themes"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState("dark");
  const [opacity, setOpacity] = useState(1); 


  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem("APP_THEME");
        if (saved && themes[saved]) {
          setThemeName(saved);
        }
      } catch (error) {
        console.error("Failed to load theme from storage", error);
      }
    };
    loadTheme();
  }, []);

  const changeTheme = async (name) => {
    if (themes[name]) {
      setThemeName(name);
      try {
        await AsyncStorage.setItem("APP_THEME", name);
      } catch (error) {
        console.error("Failed to save theme", error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[themeName], themeName, changeTheme, opacity, setOpacity }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
