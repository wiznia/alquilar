import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { perPage } from '../config';
import { useAppContext } from './AppContext';

export default function Pagination() {
  const { page, setPage, data } = useAppContext();
  const count = data?.getListings?.count || 0;
  const pagesPerPage = Math.ceil(count / perPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= pagesPerPage && pageNumber !== page) {
      setPage(pageNumber);
    }
  };

  return (
    <>
      {pagesPerPage !== 1 && (
        <div className="pagination">
          <Head>
            <title>{`Alquil.ar - Página ${page} de ${pagesPerPage}`}</title>
          </Head>
          <Link legacyBehavior href={`/?page=${page - 1}`}>
            <a className="pagination__item" aria-disabled={page <= 1}>
              Anterior
            </a>
          </Link>
          {[...Array(pagesPerPage)].map((_, i) => (
            <Link
              className={`pagination__item ${
                page === i + 1 ? 'pagination__item--active' : ''
              }`}
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              href={`/?page=${i + 1}`}
            >
              {i + 1}
            </Link>
          ))}
          <Link legacyBehavior href={`/?page=${page + 1}`}>
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
