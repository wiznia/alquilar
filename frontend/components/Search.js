import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { list } from './data';
import AutoComplete from './AutoComplete';
import { SEARCH_LISTINGS_QUERY } from './queries/queries';

export default function Search() {
  const router = useRouter();
  const [selected, setSelected] = useState('');
  const [findListings, { loading, error }] = useLazyQuery(
    SEARCH_LISTINGS_QUERY,
    {
      fetchPolicy: 'no-cache',
      onCompleted: (data) => {
        const searchValue = document.querySelector(
          'input[type="search"]',
        ).value;
        router.push({
          pathname: '/results',
          query: {
            results: JSON.stringify(data.getListings.listings),
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
      variables: {
        searchTerm: searchValue,
      },
    });
  };

  if (error) return <p>Error: {error.message}</p>;
  if (error) console.error('Error:', error);

  return (
    <form onSubmit={(e) => submitSearch(e)} type="submit" className="search">
      <AutoComplete
        placeholder="Buscar por ciudad o barrio"
        options={list}
        value={selected}
        onChange={(val) => setSelected(val)}
      />
      <button type="submit">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
        >
          <g clipPath="url(#a)">
            <path
              fill="#fff"
              fillRule="evenodd"
              d="m11.46 10.319 4.304 4.304a.806.806 0 1 1-1.141 1.14l-4.304-4.303a6.4 6.4 0 1 1 1.14-1.141h.002Zm-5.06.88a4.8 4.8 0 1 0 0-9.6 4.8 4.8 0 0 0 0 9.6Z"
              clipRule="evenodd"
            />
          </g>
          <defs>
            <clipPath id="a">
              <path fill="#fff" d="M0 0h16v16H0z" />
            </clipPath>
          </defs>
        </svg>
      </button>
    </form>
  );
}
