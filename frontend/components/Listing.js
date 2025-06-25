import Link from 'next/link';
import formatMoney from '../lib/formatMoney';
import ListItem from './ListItem';
import ImageSlider from './ImageSlider';
import { useAuth } from './AuthContext';
import { useMutation } from '@apollo/client';
import { LIKE_LISTING } from './queries/queries';
import Icon from './Icon';

export default function Listing({ listing }) {
  const { user } = useAuth();
  const {
    ambientes,
    antiguedad_max,
    banos,
    dormitorios,
    likes,
    moneda,
    superficie_cubierta,
    superficie_total,
  } = listing;
  const features = {
    ambientes,
    dormitorios,
    banos,
    superficie_total,
    superficie_cubierta,
    antiguedad_max,
  };
  const [likeListing] = useMutation(LIKE_LISTING);

  const handleLike = async (listingId) => {
    try {
      await likeListing({ variables: { listingId } });
    } catch (error) {
      console.error('Error liking listing:', error);
    }
  };

  const isLiked = likes?.filter((like) => {
    return like?.id?.includes(user?.id);
  });

  return (
    <div className="entry shadow">
      <Link className="entry__link" href={`/listing/${listing.id}`}>
        <ImageSlider listing={listing} thumbnails="no" />
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
      {user &&
        user.tipo_de_cuenta !== 'Dueño' &&
        (isLiked?.length > 0 ? (
          <Icon
            name="heartFilled"
            className="entry__heart"
            onClick={() => handleLike(listing.id)}
          />
        ) : (
          <Icon
            name="heart"
            className="entry__heart"
            onClick={() => handleLike(listing.id)}
          />
        ))}
    </div>
  );
}
