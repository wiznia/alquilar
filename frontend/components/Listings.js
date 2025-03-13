import { useAppContext } from './AppContext';
import Listing from './Listing';

export default function Listings() {
  const { data, loading, error } = useAppContext();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading listings</p>;

  const getListings = data?.getListings || { count: 0, listings: [] };
  const { count, listings } = getListings;

  return (
    <>
      {count === 0 ? (
        <>
          <h4>Lo sentimos, no hay propiedades con los filtros aplicados.</h4>
          <h5>Probá eliminando alguno de los filtros.</h5>
        </>
      ) : (
        <div className="entries">
          {listings.map((listing) => (
            <Listing key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </>
  );
}
