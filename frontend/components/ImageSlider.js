import { useState } from 'react';
import Icon from './Icon';

export default function ImageSlider({ listing, thumbnails }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const handlePrevious = (e) => {
    e.preventDefault();
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? listing.fotos.length - 1 : prevIndex - 1,
    );
  };
  const handleNext = (e) => {
    e.preventDefault();
    setCurrentIndex((prevIndex) =>
      prevIndex === listing.fotos.length - 1 ? 0 : prevIndex + 1,
    );
  };
  const handleThumbnail = (e) => {
    const index = parseInt(e.target.dataset.index);
    setCurrentIndex(index);
  };

  return (
    <div className="gallery">
      {thumbnails === 'yes' && listing.fotos?.length > 1 && (
        <div className="gallery__thumbnails">
          {listing.fotos?.map((foto, i) => (
            <img
              key={foto.id}
              data-index={i}
              onClick={(e) => handleThumbnail(e)}
              className="gallery__photos"
              src={foto?.url}
              alt={listing.titulo}
            />
          ))}
        </div>
      )}
      <div className="gallery__container">
        {listing.fotos?.length > 1 && (
          <>
            <button
              onClick={(e) => handleNext(e)}
              className="gallery__nav gallery__nav--right"
            >
              <Icon name="arrowGalleryRight" />
            </button>
            <button
              onClick={(e) => handlePrevious(e)}
              className="gallery__nav gallery__nav--left"
            >
              <Icon name="arrowGalleryLeft" />
            </button>
          </>
        )}
        <div
          className="gallery__inner"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {listing.fotos.length === 0 && (
            <img
              className="gallery__photos"
              src="/static/listing-default.png"
            />
          )}
          {listing.fotos?.map((foto) => (
            <img
              key={foto.id}
              className="gallery__photos"
              src={foto?.url}
              alt={listing.titulo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
