'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER } from './queries/queries';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { data, loading, error, refetch } = useQuery(GET_USER, {
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    }
  }, [data]);

  const login = async () => {
    await refetch();
    if (data?.user) {
      setUser(data.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
