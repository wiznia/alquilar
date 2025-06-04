'use client';

import { Modal } from '@/components/Modal';
import { DELETE_LISTING } from '@/components/queries/queries';
import { useToast } from '@/components/ToastContext';
import { useMutation } from '@apollo/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function DeleteListingModal() {
  const router = useRouter();
  const id = useSearchParams().get('id');
  const [deleteListing] = useMutation(DELETE_LISTING);
  const showToast = useToast();

  const handleSubmit = async () => {
    try {
      await deleteListing({
        variables: {
          id,
        },
      });
      showToast('Inmueble eliminado con éxito!');
      router.back();
    } catch (error) {
      showToast(
        `Hubo un problema al eliminar este inmueble: ${error}`,
        'error',
      );
      console.error('Error deleting listing:', error);
    }
  };
  return (
    <Modal className="dialog--small">
      <h4>¿Estás seguro que querés eliminar esta publicación?</h4>
      <div className="button-container">
        <button
          className="button button--secondary"
          onClick={() => {
            router.back();
          }}
        >
          Cancelar
        </button>
        <button className="button button--danger" onClick={handleSubmit}>
          Eliminar
        </button>
      </div>
    </Modal>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <DeleteListingModal />
    </Suspense>
  );
}
