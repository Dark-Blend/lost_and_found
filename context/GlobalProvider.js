import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../services/authService";

const GlobalContext = createContext();

export const useGlobalContext = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });
  }, []);

  return (
    <GlobalContext.Provider value={{ currentUser, isLoading, setIsLoading, setCurrentUser }}>
      {children}
    </GlobalContext.Provider>
  );
};