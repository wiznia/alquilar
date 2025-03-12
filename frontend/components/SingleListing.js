import { useQuery } from '@apollo/client';
import ImageSlider from './ImageSlider';
import ListItem from './ListItem';
import formatMoney from '../lib/formatMoney';
import { APIProvider } from '@vis.gl/react-google-maps';
import { SINGLE_LISTING_QUERY } from './queries/queries';
import MapComponent from './Map';

export default function SingleListingPage({ id }) {
  const { data, loading, error } = useQuery(SINGLE_LISTING_QUERY, {
    variables: {
      id,
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const {
    titulo,
    ambientes,
    dormitorios,
    banos,
    superficie_total,
    superficie_cubierta,
    precio,
    expensas,
    direccion,
    barrio,
    localidad,
    descripcion,
    antiguedad_max,
  } = data.getListingById;
  const features = {
    ambientes,
    dormitorios,
    banos,
    superficie_total,
    superficie_cubierta,
    antiguedad_max,
  };

  return (
    <div className="single-entry">
      <ImageSlider listing={data.getListingById} thumbnails="yes" />
      <div className="single-container">
        <div className="entry__info">
          <h2>{formatMoney(precio)}</h2>
          <h5>{formatMoney(expensas)} Expensas</h5>
          <div className="address">
            <h5>{direccion}</h5>
            <p>
              {barrio}, {localidad}
            </p>
          </div>
          <ul className="entry__list">
            {Object.entries(features).map(([key, value]) => (
              <ListItem key={key} listing={[key, value]} />
            ))}
          </ul>
          <h5>{titulo}</h5>
          <p className="entry__description">{descripcion}</p>
        </div>
        <div className="entry__contact"></div>
      </div>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}>
        <MapComponent address={`${direccion}, ${localidad}`} />
      </APIProvider>
    </div>
  );
}
