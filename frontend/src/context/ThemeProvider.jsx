import React, { useState, useEffect, createContext } from "react";

// Create a theme context to make the theme state available across your app
export const ThemeContext = createContext({
  darkMode: true,
  toggleTheme: () => {},
});

// Create a ThemeProvider component to wrap your app
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    // Add or remove 'light-mode' class from html element for broader scope
    if (newMode) {
      document.documentElement.classList.remove("light-mode");
    } else {
      document.documentElement.classList.add("light-mode");
    }

    // Store preference in localStorage
    localStorage.setItem("darkMode", newMode.toString());
  };

  // Check for saved preference on initial load
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      const isDarkMode = savedMode === "true";
      setDarkMode(isDarkMode);

      if (!isDarkMode) {
        document.documentElement.classList.add("light-mode");
      } else {
        document.documentElement.classList.remove("light-mode");
      }
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
