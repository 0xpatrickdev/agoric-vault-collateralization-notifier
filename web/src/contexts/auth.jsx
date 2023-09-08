import { createContext, useState } from "react";
import { requestAuthToken, verifyAuthToken } from "../lib/api";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  // @todo verify prescense of cookie, and check if cookie is still valid
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoggedIn, _setIsLoggedIn] = useState(() => {
    const isLoggedIn = window?.localStorage.getItem("isLoggedIn");
    return isLoggedIn === "true";
  });

  /** @param {boolean} isLoggedIn */
  const setIsLoggedIn = (isLoggedIn) => {
    window?.localStorage.setItem("isLoggedIn", isLoggedIn ? "true" : "false");
    _setIsLoggedIn(!!isLoggedIn);
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
      if (res.ok) setIsLoggedIn(true);
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
