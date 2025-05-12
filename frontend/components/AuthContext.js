'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER } from './queries/queries';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const router = useRouter();

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const setCookie = (name, value, days) => {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value}; path=/; Secure; SameSite=Strict${expires}`;
  };

  const deleteCookie = (name) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Strict`;
  };

  const { data, loading, error } = useQuery(GET_USER, {
    fetchPolicy: 'no-cache',
    skip: !token,
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const login = async () => {
    const authToken = getCookie('authToken');
    if (authToken) {
      setToken(authToken);
    }
  };

  useEffect(() => {
    const authToken = getCookie('authToken');
    if (authToken) {
      setToken(authToken);
    }
  }, []);

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    }
  }, [data]);

  const logout = async () => {
    deleteCookie('authToken');
    setUser(null);
    setToken(null);
    router.push('/');
  };

  const handleRegister = async (token) => {
    setCookie('authToken', token, 7);
    setToken(token);
    await login();
    router.push('/account');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        handleRegister,
        setCookie,
        getCookie,
        deleteCookie,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
