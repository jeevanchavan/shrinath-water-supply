import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/services";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem("swd_user")) || null; }
    catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Verify stored token on mount
  useEffect(() => {
    let cancelled = false; // prevent state update if component unmounts

    const verify = async () => {
      const token = localStorage.getItem("swd_token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Safety timeout: if the API call takes more than 8 seconds,
      // stop the spinner so the user is never stuck on a blank screen.
      const timeoutId = setTimeout(() => {
        if (!cancelled) {
          console.warn("Auth verification timed out – falling back to stored user.");
          setLoading(false);
        }
      }, 8000);

      try {
        const res = await authApi.getMe();
        if (!cancelled) {
          setUser(res.data.data.user);
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem("swd_token");
          localStorage.removeItem("swd_user");
          setUser(null);
        }
      } finally {
        clearTimeout(timeoutId);
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    verify();

    return () => { cancelled = true; };
  }, []);

  const login = async (phone, password) => {
    const res       = await authApi.login({ phone, password });
    const { token, user: u } = res.data.data;
    localStorage.setItem("swd_token", token);
    localStorage.setItem("swd_user",  JSON.stringify(u));
    setUser(u);
    toast.success(`Welcome, ${u.name}!`);
    return u;
  };

  const logout = () => {
    localStorage.removeItem("swd_token");
    localStorage.removeItem("swd_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
