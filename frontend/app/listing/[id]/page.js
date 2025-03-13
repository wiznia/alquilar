'use client';

import { useParams } from 'next/navigation';
import SingleListingPage from '../../../components/SingleListing';

function ListingPage() {
  const params = useParams();
  const { id } = params;

  if (!id) return <p>Loading...</p>;

  return <SingleListingPage id={id} />;
}

export default ListingPage;
