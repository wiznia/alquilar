'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function Modal({ children }) {
  const router = useRouter();
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      ref.current.showModal();
    }
  }, []);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        router.back();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <dialog ref={ref}>
      <button
        className="close"
        onClick={() => {
          router.back();
        }}
      >
        &times;
      </button>
      <div className="modal-container">{children}</div>
    </dialog>
  );
}
