import { createContext, useContext, useState } from "react";
import { requestAuthToken, verifyAuthToken } from "../lib/api";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  // @todo verify prescense of cookie, and check if cookie is still valid
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoggedIn, _setIsLoggedIn] = useState(() => {
    const isLoggedIn = window?.localStorage.getItem("isLoggedIn");
    return isLoggedIn === "true";
  });

  const setIsLoggedIn = async () => {
    window?.localStorage.setItem("isLoggedIn", "true");
    _setIsLoggedIn(true);
  };

  const register = async (email) => {
    try {
      await requestAuthToken(email);
    } catch (error) {
      throw new Error(error);
    }
  };

  const verifyToken = async (token) => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const res = await verifyAuthToken(token);
      if (res.success) setIsLoggedIn(true);
    } catch (error) {
      throw new Error("This link is invalid or expired. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        register,
        verifyToken,
        isVerifying,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};
