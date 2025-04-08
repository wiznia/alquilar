import { useEffect, useState } from 'react';

export default function Rating({ ratings }) {
  const [allRatingsCount, setAllRatingsCount] = useState(0);
  const [sortedRatings, setSortedRatings] = useState({});

  useEffect(() => {
    if (!ratings) return;

    const groupedRatings = Object.groupBy(ratings, (rating) => {
      return rating.rating;
    });
    const completeRatings = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      ...groupedRatings,
    };

    setSortedRatings(completeRatings);
    setAllRatingsCount(Object.values(completeRatings).flat().length);
  }, [ratings]);

  return (
    <div className="rating-container">
      {Object.entries(sortedRatings).map(([rating, ratingArray]) => {
        const percentage = (ratingArray.length / allRatingsCount) * 100;
        return (
          <div className="rating" key={rating}>
            <small>
              {rating} {rating === '1' ? 'estrella' : 'estrellas'}
            </small>
            <progress max="100" value={percentage.toFixed(0)}></progress>
            <small>
              {percentage === 0 ? percentage : percentage.toFixed(0)}%
            </small>
          </div>
        );
      })}
    </div>
  );
}
