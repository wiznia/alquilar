import { useRouter } from 'next/router';
import Listing from '@/components/Listing';

export default function ResultsPage() {
  const router = useRouter();
  const { results, searchTerm } = router.query;
  const listings = results ? JSON.parse(results) : [];
  return (
    <div>
      <h2>
        {listings.length} resultado
        {listings.length > 1 || listings.length === 0 ? 's' : ''} para la
        búsqueda "{searchTerm}"
      </h2>
      {listings.length > 0 ? (
        <div className="entries">
          {listings.map((listing) => (
            <Listing key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <h6>Tal vez te interesen estas otras publicaciones:</h6>
      )}
    </div>
  );
}
