'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { APIProvider } from '@vis.gl/react-google-maps';
import { AppProvider, useAppContext } from '../components/AppContext';
import Listings from '../components/Listings';
import Pagination from '../components/Pagination';
import SortBar from '../components/SortBar';
import SearchFilters from '../components/SearchFilters';
import Hero from '@/components/Hero';

function PageContent() {
  const { setPage } = useAppContext();
  const pageParams = useSearchParams();
  const page = parseInt(pageParams.get('page')) || 1;

  useEffect(() => {
    setPage(page);
  }, [page, setPage]);

  return (
    <>
      <Hero />
      <SearchFilters />
      <SortBar />
      <Listings />
      <Pagination />
    </>
  );
}

export default function ListingsPage() {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}>
      <AppProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <PageContent />
        </Suspense>
      </AppProvider>
    </APIProvider>
  );
}
