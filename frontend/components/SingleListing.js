import { useQuery } from '@apollo/client';
import { useAuth } from '@/components/AuthContext';
import ImageSlider from './ImageSlider';
import ListItem from './ListItem';
import formatMoney from '../lib/formatMoney';
import { APIProvider } from '@vis.gl/react-google-maps';
import { SINGLE_LISTING_QUERY, GET_LISTINGS_BY_OWNER } from './queries/queries';
import MapComponent from './Map';
import Loading from './Loading';
import { formatText } from '@/config';
import ContactForm from '@/lib/ContactForm';
import { useEffect, useState } from 'react';
import Listing from './Listing';

export default function SingleListingPage({ id }) {
  const { data, loading, error } = useQuery(SINGLE_LISTING_QUERY, {
    variables: {
      id,
    },
  });
  const { user } = useAuth();
  const [userId, setUserId] = useState(null);
  const {
    data: dataRelated,
    loading: loadingRelated,
    error: errorRelated,
    refetch,
  } = useQuery(GET_LISTINGS_BY_OWNER, {
    variables: {
      id: userId,
    },
    skip: !userId,
  });

  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user]);

  const dataRelatedFiltered = dataRelated?.getListings?.listings.filter(
    (listing) => listing.id !== id,
  );

  if (loading) {
    return (
      <Loading>
        <h4>Cargando publicación...</h4>
      </Loading>
    );
  }
  if (error) return <p>Error: {error.message}</p>;

  const {
    ambientes,
    ammenities,
    antiguedad_max,
    banos,
    barrio,
    descripcion,
    direccion,
    dormitorios,
    expensas,
    owner,
    precio,
    provincia,
    superficie_cubierta,
    superficie_total,
    tipo_de_alquiler,
    tipo_de_ambientes,
    tipo_de_propiedad,
    titulo,
    toilettes,
  } = data.getListingById;
  const features = {
    ambientes,
    dormitorios,
    banos,
    superficie_total,
    superficie_cubierta,
    antiguedad_max,
    toilettes,
  };

  return (
    <div className="single-entry">
      <ImageSlider listing={data.getListingById} thumbnails="yes" />
      <div className="single-container">
        <div className="entry__info">
          {tipo_de_alquiler === 'Alquiler temporario' && (
            <span className="pill">{tipo_de_alquiler}</span>
          )}
          <h2>{formatMoney(precio)}</h2>
          <h5>{formatMoney(expensas)} Expensas</h5>
          <div className="address">
            <h5>{direccion}</h5>
            <p>
              {barrio}, {provincia}
            </p>
          </div>
          <ul className="entry__list">
            {Object.entries(features).map(([key, value]) => (
              <ListItem key={key} listing={[key, value]} />
            ))}
          </ul>
          {(tipo_de_ambientes.length > 0 ||
            ammenities.length > 0 ||
            tipo_de_propiedad.length > 0) && <h6>Características:</h6>}
          <div className="entry__features">
            <p>{formatText(tipo_de_propiedad)}</p>
            {tipo_de_ambientes.map((ambiente) => (
              <p key={ambiente}>{formatText(ambiente)}</p>
            ))}
            {ammenities.map((ammenity) => (
              <p key={ammenity}>{formatText(ammenity)}</p>
            ))}
          </div>
          <h5>{titulo}</h5>
          <h6 className="entry__description">{descripcion}</h6>
        </div>
        <ContactForm contactCard="true" owner={owner} />
      </div>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}>
        <MapComponent address={`${direccion}, ${barrio}, ${provincia}`} />
      </APIProvider>
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
    </div>
  );
}
