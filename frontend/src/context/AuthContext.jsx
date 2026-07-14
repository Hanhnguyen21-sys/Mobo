/**
 * This is the piece that remembers:
 * - who is logged in?
 * - what token do we have?
 * - how do we login/register/logout?
 */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      const token = localStorage.getItem("mobo_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest("/auth/me");
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem("mobo_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  async function register(formData) {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    localStorage.setItem("mobo_token", data.token);
    setUser(data.user);

    return data;
  }
  async function updateProfile(formData) {
    const data = await apiRequest("/auth/me", {
      method: "PUT",
      body: JSON.stringify(formData),
    });

    setUser(data.user);

    return data;
  }
  async function login(formData) {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    localStorage.setItem("mobo_token", data.token);
    setUser(data.user);

    return data;
  }

  function logout() {
    localStorage.removeItem("mobo_token");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      register,
      login,
      logout,
      updateProfile,
      isAuthenticated: Boolean(user),
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
