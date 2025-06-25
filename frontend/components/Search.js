import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { SEARCH_LISTINGS_QUERY } from './queries/queries';
import Icon from './Icon';

export default function Search() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [findListings, { loading, error }] = useLazyQuery(
    SEARCH_LISTINGS_QUERY,
    {
      onCompleted: (data) => {
        const searchValue = document.querySelector(
          'input[type="search"]',
        ).value;
        router.push('/results', {
          state: {
            results: data.getListings.listings,
            searchTerm: searchValue,
          },
        });
      },
    },
  );

  const submitSearch = (e) => {
    e.preventDefault();
    const searchValue = document.querySelector('input[type="search"]').value;
    findListings({
      variables: { searchTerm: searchValue },
      onCompleted: (data) => {
        sessionStorage.setItem(
          'searchResults',
          JSON.stringify(data.getListings.listings),
        );
        sessionStorage.setItem('searchTerm', searchValue);
        router.push('/results');
      },
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (error) console.error('Error:', error);

  return (
    <form onSubmit={(e) => submitSearch(e)} type="submit" className="search">
      <div className="search-container">
        <input
          className="p"
          type="search"
          placeholder="Buscar propiedades"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <button type="submit">
        <Icon name="search" />
      </button>
    </form>
  );
}
