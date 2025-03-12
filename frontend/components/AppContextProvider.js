import { useState, useEffect, createContext } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { perPage } from '../config';
import { ALL_LISTINGS_QUERY } from './queries/queries';

export const AppContext = createContext();

export function AppContextProvider({ children }) {
  const { query } = useRouter();
  const page = parseInt(query.page) || 1;
  const [sortBy, setSortBy] = useState('id_ASC');
  const [filterVariables, setFilterVariables] = useState({});
  const { data, error, loading, refetch } = useQuery(ALL_LISTINGS_QUERY, {
    variables: {
      skip: page * perPage - perPage,
      first: perPage,
      sortBy,
      ...filterVariables,
    },
  });

  const updateListings = (newFilters, fieldName) => {
    setFilterVariables((prevFilters) => {
      let updatedFilters = { ...prevFilters };

      if (Array.isArray(newFilters)) {
        if (newFilters.length) {
          updatedFilters[fieldName] = newFilters;
        } else {
          delete updatedFilters[fieldName];
        }
      } else if (typeof newFilters === 'string') {
        updatedFilters[fieldName] = newFilters;
      } else if (
        newFilters === null ||
        (Object.keys(newFilters).length === 0 && typeof newFilters !== 'number')
      ) {
        if (fieldName === 'moneda') {
          delete updatedFilters['precio_min'];
          delete updatedFilters['precio_max'];
          delete updatedFilters[fieldName];
        } else {
          delete updatedFilters[fieldName];
        }
      } else if (typeof newFilters === 'number') {
        updatedFilters[fieldName] = newFilters;
      }

      return updatedFilters;
    });
  };

  useEffect(() => {
    refetch({
      skip: page * perPage - perPage,
      first: perPage,
      sortBy,
      ...filterVariables,
    });
  }, [filterVariables, page, sortBy]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <AppContext.Provider
      value={{
        page,
        data,
        sortBy,
        setSortBy,
        updateListings,
        filterVariables,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
