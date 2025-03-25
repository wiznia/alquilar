import Link from 'next/link';
import formatMoney from '../lib/formatMoney';
import ListItem from './ListItem';
import ImageSlider from './ImageSlider';

export default function Listing({ listing }) {
  const {
    ambientes,
    dormitorios,
    banos,
    superficie_total,
    superficie_cubierta,
    antiguedad_max,
    moneda,
  } = listing;
  const features = {
    ambientes,
    dormitorios,
    banos,
    superficie_total,
    superficie_cubierta,
    antiguedad_max,
  };

  return (
    <div className="entry shadow">
      <ImageSlider listing={listing} thumbnails="no" />
      <Link className="entry__link" href={`/listing/${listing.id}`}>
        <div className="entry__info">
          <h4>{formatMoney(listing.precio, moneda)}</h4>
          <p>{formatMoney(listing.expensas)} Expensas</p>
          <div className="address">
            <h6>{listing.direccion}</h6>
            <p>
              {listing.barrio}, {listing.provincia}
            </p>
          </div>
          <ul className="entry__list">
            {Object.entries(features).map(([key, value]) => (
              <ListItem key={key} listing={[key, value]} />
            ))}
          </ul>
          <p className="entry__description">{listing.descripcion}</p>
        </div>
      </Link>
    </div>
  );
}
