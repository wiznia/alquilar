import { useState, useContext } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { perPage } from '../config';
import { AppContext } from '../pages/listings';

export default function Pagination() {
  const { page, data } = useContext(AppContext);
  const [pages, setPages] = useState(1);
  const pagesPerPage = Math.ceil(data.getListings.count / perPage);
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= pagesPerPage && pageNumber !== pages) {
      setPages(pageNumber);
    }
  };

  return (
    <>
      {pagesPerPage !== 1 && (
        <div className="pagination">
          <Head>
            <title>{`Alquil.ar - Página ${page} de ${perPage}`}</title>
          </Head>
          <Link legacyBehavior href={`/listings/${page - 1}`}>
            <a className="pagination__item" aria-disabled={page <= 1}>
              Anterior
            </a>
          </Link>
          {[...Array(Math.floor(pagesPerPage))].map((_, i) => (
            <Link
              className={`pagination__item ${
                page === i + 1 ? 'pagination__item--active' : ''
              }`}
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              href={`/listings/${i + 1}`}
            >
              {i + 1}
            </Link>
          ))}
          <Link legacyBehavior href={`/listings/${page + 1}`}>
            <a
              className="pagination__item"
              aria-disabled={page >= pagesPerPage}
            >
              Siguiente
            </a>
          </Link>
        </div>
      )}
    </>
  );
}
