import Link from 'next/link';
import formatMoney from '../lib/formatMoney';
import ListItem from './ListItem';
import ImageSlider from './ImageSlider';
import { useAuth } from './AuthContext';
import { useMutation } from '@apollo/client';
import { LIKE_LISTING_MUTATION } from './queries/queries';

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
  const [likeListing] = useMutation(LIKE_LISTING_MUTATION);

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
      {user &&
        (isLiked?.length > 0 ? (
          <svg
            width="25"
            height="25"
            className="entry__heart"
            onClick={() => handleLike(listing.id)}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 122.88 107.41"
          >
            <path
              fill="#ff0000"
              d="M60.83 17.19C68.84 8.84 74.45 1.62 86.79.21c23.17-2.66 44.48 21.06 32.78 44.41-3.33 6.65-10.11 14.56-17.61 22.32-8.23 8.52-17.34 16.87-23.72 23.2l-17.4 17.26-14.38-13.84C29.16 76.9.95 55.93.02 29.95-.63 11.75 13.73.09 30.25.3c14.76.2 20.97 7.54 30.58 16.89z"
            />
          </svg>
        ) : (
          <svg
            width="25"
            height="25"
            className="entry__heart"
            onClick={() => handleLike(listing.id)}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 122.88 109.57"
          >
            <path d="M65.46 19.57c-.68.72-1.36 1.45-2.2 2.32l-2.31 2.41-2.4-2.33c-.71-.69-1.43-1.4-2.13-2.09C49 12.58 43.41 7.08 31.9 6.93c-.45-.01-.93 0-1.43.02-6.44.23-12.38 2.6-16.72 6.65-4.28 4-7.01 9.67-7.1 16.57-.01.43 0 .88.02 1.37.69 19.27 19.13 36.08 34.42 50.01 2.95 2.69 5.78 5.27 8.49 7.88l11.26 10.85 14.15-14.04c2.28-2.26 4.86-4.73 7.62-7.37 4.69-4.5 9.91-9.49 14.77-14.52 3.49-3.61 6.8-7.24 9.61-10.73 2.76-3.42 5.02-6.67 6.47-9.57 2.38-4.76 3.13-9.52 2.62-13.97-.5-4.39-2.23-8.49-4.82-11.99a28.623 28.623 0 0 0-10.14-8.5C96.5 7.29 91.21 6.2 85.8 6.82c-9.33 1.08-14.3 6.35-20.34 12.75zm-4.69-4.72C67.67 7.54 73.4 1.55 85.04.22c6.72-.77 13.3.57 19.03 3.45 4.95 2.48 9.27 6.1 12.51 10.47 3.27 4.42 5.46 9.61 6.1 15.19.65 5.66-.29 11.69-3.3 17.69-1.7 3.39-4.22 7.03-7.23 10.76-2.95 3.66-6.39 7.44-10 11.17-4.95 5.13-10.21 10.17-14.95 14.71-2.77 2.65-5.36 5.13-7.54 7.29L63.2 107.28l-2.31 2.29-2.34-2.25-13.6-13.1c-2.49-2.39-5.37-5.02-8.36-7.75C20.38 71.68.81 53.85.02 31.77 0 31.23 0 30.67 0 30.09c.12-8.86 3.66-16.18 9.21-21.36C14.71 3.6 22.18.6 30.22.31c.55-.02 1.13-.03 1.74-.02C46 .48 52.42 6.63 60.77 14.85z" />
          </svg>
        ))}
    </div>
  );
}
