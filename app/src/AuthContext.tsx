import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from './config';

interface AuthContextType {
  user: any;
  token: string | null;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: (overrideToken?: string) => Promise<void>;
  updateUserAndToken: (data: { token: string; user: any }) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  pendingRegister: {
    name: string;
    email: string;
    password: string;
  } | null;
  setPendingRegister: (
    data: { name: string; email: string; password: string } | null
  ) => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [pendingRegister, setPendingRegister] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setToken = async (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      await AsyncStorage.setItem('token', newToken);
    } else {
      await AsyncStorage.removeItem('token');
    }
  };

  const updateUserAndToken = async ({
    token,
    user,
  }: {
    token: string;
    user: any;
  }) => {
    const newUser = {
      id: user._id || user.userId || user.id,
      ...user,
    };

    await setToken(token);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };


  const refreshUser = async (overrideToken?: string) => {
    try {
      const authToken = overrideToken || token;
      if (!authToken) return;

      const res = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const rawUser = res.data.user || res.data;

      const newUser = {
        id: rawUser._id || rawUser.userId || rawUser.id, // <-- dùng id
        ...rawUser,
      };



      setUser(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));

      if (overrideToken) {
        await setToken(overrideToken);
      }
    } catch (err) {
      console.log('Lỗi khi load lại user:', err);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email,
        password,
      });
      const { token, user } = res.data;
      await updateUserAndToken({ token, user });
    } catch (err: any) {
      console.error('Lỗi đăng nhập:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
      throw new Error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.clear();
    setTokenState(null);
    setUser(null);
    setPendingRegister(null);
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        full_name: name,
        email,
        password,
      });

      console.log('✅ Đăng ký thành công, chờ xác minh email...');
      setPendingRegister({ name, email, password });
    } catch (err: any) {
      console.error('Lỗi đăng ký:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Đăng ký thất bại');
      throw new Error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Tự động load lại user từ token khi khởi động app
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setTokenState(storedToken);
        await refreshUser(storedToken);
      }
    };
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setToken,
        login,
        logout,
        refreshUser,
        updateUserAndToken,
        register,
        pendingRegister,
        setPendingRegister,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải dùng trong <AuthProvider>');
  return context;
};
