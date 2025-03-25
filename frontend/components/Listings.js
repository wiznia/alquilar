import { useAppContext } from './AppContext';
import Listing from './Listing';

export default function Listings() {
  const { data, loading, error } = useAppContext();

  if (loading) {
    return (
      <div className="loading">
        <h4>Cargando publicaciones...</h4>
      </div>
    );
  }
  if (error) {
    return (
      <div className="loading">
        <p>
          Hubo un problema al cargar el listado de publicaciones:
          {error.message}
        </p>
      </div>
    );
  }

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
