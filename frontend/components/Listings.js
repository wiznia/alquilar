import { useContext } from 'react';
import { AppContext } from '../pages/listings';
import Listing from './Listing';

export default function Listings() {
  const { data } = useContext(AppContext);
  const { count } = data.getListings;

  return (
    <>
      {count === 0 ? (
        <>
          <h4>Lo sentimos, no hay propiedades con los filtros aplicados.</h4>
          <h5>Probá eliminando alguno de los filtros.</h5>
        </>
      ) : (
        <div className="entries">
          {data.getListings.listings.map((listing) => (
            <Listing key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </>
  );
}
