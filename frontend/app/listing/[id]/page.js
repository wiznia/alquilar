'use client';

import { useParams } from 'next/navigation';
import SingleListingPage from '../../../components/SingleListing';
import Loading from '@/components/Loading';

function ListingPage() {
  const params = useParams();
  const { id } = params;

  if (!id) {
    return (
      <Loading>
        <h4>Cargando publicación...</h4>
      </Loading>
    );
  }

  return <SingleListingPage id={id} />;
}

export default ListingPage;
