import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User, LoginDTO, RegisterDTO } from "@taskflow/types";
import { authApi, setToken, clearToken, getToken } from "../lib/api";
import { connectSocket, disconnectSocket } from "../lib/socket";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginDTO) => Promise<User>;
  register: (data: RegisterDTO) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((u) => {
        setUser(u);
        connectSocket();
      })
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = useCallback(({ user, token }: { user: User; token: string }) => {
    setToken(token);
    setUser(user);
    connectSocket();
    return user;
  }, []);

  const login = useCallback(
    async (data: LoginDTO) => handleAuth(await authApi.login(data)),
    [handleAuth],
  );

  const register = useCallback(
    async (data: RegisterDTO) => handleAuth(await authApi.register(data)),
    [handleAuth],
  );

  const logout = useCallback(() => {
    clearToken();
    disconnectSocket();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
