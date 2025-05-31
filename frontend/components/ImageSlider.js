import { useState } from 'react';

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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="33"
                fill="none"
              >
                <path
                  fill="#FF9500"
                  d="M.548 27.703 12.075 16.16.548 4.617 2.853 0l16.138 16.16L2.853 32.32.548 27.703Z"
                />
              </svg>
            </button>
            <button
              onClick={(e) => handlePrevious(e)}
              className="gallery__nav gallery__nav--left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="31"
                fill="none"
              >
                <path
                  fill="#FF9500"
                  d="M18.26 4.329 7.453 15.15 18.26 25.971 16.098 30.3.97 15.15 16.099 0l2.16 4.329Z"
                />
              </svg>
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
