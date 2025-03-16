'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

const GET_USER = gql`
  query GetUser {
    user {
      id
      email
      nombre
      apellido
      usuario
      condicion_fiscal
      dni
      telefono
      celular
    }
  }
`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { data, loading, error } = useQuery(GET_USER, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (data && data.user) {
      setUser(data.user);
    }
  }, [data]);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
