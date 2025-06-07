import React, { useState } from "react";
const AuthContext = React.createContext({
  user_id: null,
  user: null,
  role: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});
export const useAuth = () => React.useContext(AuthContext);
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem("user") || null);
  const [user_id, setUserId] = useState(
    localStorage.getItem("user_id") || null
  );
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("user") && !!localStorage.getItem("role")
  );
  const login = ({ username, role, user_id }) => {
    setUser(username);
    setRole(role);
    setUserId(user_id);
    console.log("User logged in:", username, role);
    setIsAuthenticated(true);
    localStorage.setItem("user", username);
    localStorage.setItem("role", role);
    localStorage.setItem("user_id", user_id);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setUserId(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
  };

  return (
    <AuthContext.Provider
      value={{ user, role, user_id, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
export default AuthProvider;
