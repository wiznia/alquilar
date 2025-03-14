'use client';

import { useEffect, useState } from 'react';
import Listing from '@/components/Listing';
import SearchFilters from '@/components/SearchFilters';
import SortBar from '@/components/SortBar';
import { useRouter } from 'next/navigation';

export default function ResultsPage() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [count, setCount] = useState('');

  useEffect(() => {
    const storedResults = sessionStorage.getItem('searchResults');
    const storedSearchTerm = sessionStorage.getItem('searchTerm');

    if (storedResults && storedSearchTerm) {
      setListings(JSON.parse(storedResults));
      setSearchTerm(storedSearchTerm);
      setCount(JSON.parse(storedResults).length);
    } else {
      router.push('/');
    }
  }, []);

  return (
    <div>
      <SearchFilters />
      <SortBar count={count} />
      <h2>
        {listings.length} resultado
        {listings.length > 1 || listings.length === 0 ? 's' : ''} para la
        búsqueda "{searchTerm}"
      </h2>
      {listings.length > 0 ? (
        <div className="entries">
          {listings.map((listing) => (
            <Listing key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <h6>Tal vez te interesen estas otras publicaciones:</h6>
      )}
    </div>
  );
}
