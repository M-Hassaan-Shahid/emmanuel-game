import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

// Create an Auth Context
const AuthContext = createContext();

// AuthProvider component to wrap your application
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if the user exists in cookies or localStorage
    const userCookie = Cookies.get("user");
    const userLocal = localStorage.getItem("user");
    const token = localStorage.getItem("token") || Cookies.get("token");

    let userData = null;
    if (userCookie) {
      userData = JSON.parse(userCookie);
      setUser(userData);
    } else if (userLocal && token) {
      userData = JSON.parse(userLocal);
      setUser(userData);
    }

    // Fix for existing users: ensure userId is stored separately
    if (userData && (userData.id || userData._id)) {
      const storedUserId = localStorage.getItem("userId");
      if (!storedUserId) {
        console.log("🔧 Fixing missing userId in localStorage");
        localStorage.setItem("userId", userData.id || userData._id);
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    Cookies.set("user", JSON.stringify(userData), { expires: 7 });
    localStorage.setItem("user", JSON.stringify(userData));
    // Store userId separately for quick access
    if (userData.id || userData._id) {
      localStorage.setItem("userId", userData.id || userData._id);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    Cookies.set("user", JSON.stringify(userData), { expires: 7 });
    localStorage.setItem("user", JSON.stringify(userData));
    // Store userId separately for quick access
    if (userData.id || userData._id) {
      localStorage.setItem("userId", userData.id || userData._id);
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("user");
    Cookies.remove("token");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
