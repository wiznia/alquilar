import { useState, useEffect, createContext } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { perPage } from '../../config';
import { ALL_LISTINGS_QUERY } from '../../components/queries/queries';
import Listings from '../../components/Listings';
import Pagination from '../../components/Pagination';
import SortBar from '../../components/SortBar';
import SearchFilters from '../../components/SearchFilters';

export const AppContext = createContext();

export default function ListingsPage() {
  const { query } = useRouter();
  const page = parseInt(query.page) || 1;
  const [sortBy, setSortBy] = useState(null);
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
      <SearchFilters />
      <SortBar />
      <Listings />
      <Pagination />
    </AppContext.Provider>
  );
}
