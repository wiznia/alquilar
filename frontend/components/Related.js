import { useQuery } from '@apollo/client';
import { GET_LISTINGS_BY_OWNER } from './queries/queries';
import Listing from './Listing';

export default function Related({ owner }) {
  const {
    data: dataRelated,
    loading: loadingRelated,
    error: errorRelated,
  } = useQuery(GET_LISTINGS_BY_OWNER, {
    variables: {
      id: owner?.id,
    },
    skip: !owner?.id,
  });

  const dataRelatedFiltered = dataRelated?.getListings?.listings.filter(
    (listing) => listing.id !== owner?.id,
  );

  return (
    <>
      {dataRelatedFiltered?.length > 0 && (
        <div className="related">
          <h4>Otras publicaciones de este anunciante:</h4>
          <div className="related-listings">
            {dataRelatedFiltered?.map((listing) => (
              <Listing key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
