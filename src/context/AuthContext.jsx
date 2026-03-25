import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "@/config/api";
import { getErrorMessage, getResponseData } from "@/lib/api-helpers";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api
        .get("/auth/me")
        .then((res) => {
          const me = getResponseData(res);
          setUser(me);
          if (me?.role) {
            localStorage.setItem("role", me.role);
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          setToken("");
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const nextToken = res.data?.token;
    const role = res.data?.role;
    const nextUser = getResponseData(res);

    localStorage.setItem("token", nextToken);
    localStorage.setItem("role", role);
    setToken(nextToken);
    setUser(nextUser);

    return nextUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken("");
    setUser(null);
    window.location.href = "/login";
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      role: user?.role || localStorage.getItem("role") || "",
      login,
      logout,
      getErrorMessage,
    }),
    [loading, token, user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
