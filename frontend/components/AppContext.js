'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ALL_LISTINGS_QUERY } from './queries/queries';
import { perPage } from '../config';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [filterVariables, setFilterVariables] = useState({});
  const [sortBy, setSortBy] = useState(null);
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useQuery(ALL_LISTINGS_QUERY, {
    variables: {
      skip: (page - 1) * perPage,
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
      } else if (
        typeof newFilters === 'number' ||
        typeof newFilters === 'string'
      ) {
        updatedFilters[fieldName] = newFilters;
      } else if (
        newFilters === null ||
        (Object.keys(newFilters).length === 0 && typeof newFilters !== 'number')
      ) {
        if (fieldName === 'moneda') {
          delete updatedFilters['precio_min'];
          delete updatedFilters['precio_max'];
        } else if (fieldName === 'superficie_total') {
          delete updatedFilters['superficie_total_min'];
          delete updatedFilters['superficie_total_max'];
        }
        delete updatedFilters[fieldName];
      }

      return updatedFilters;
    });
  };

  useEffect(() => {}, [data, loading, error]);

  useEffect(() => {
    refetch({
      skip: (page - 1) * perPage,
      first: perPage,
      sortBy,
      ...filterVariables,
    }).then(({ data }) => {
      const totalCount = data?.getListings?.count || 0;
      const totalPages = Math.ceil(totalCount / perPage);

      if (page > totalPages) {
        setPage(1);
      }
    });
  }, [filterVariables, page, sortBy]);

  return (
    <AppContext.Provider
      value={{
        updateListings,
        filterVariables,
        setSortBy,
        sortBy,
        data,
        loading,
        error,
        page,
        setPage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
