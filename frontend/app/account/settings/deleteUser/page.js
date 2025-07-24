'use client';

import { useToast } from '@/components/ToastContext';
import { DELETE_USER } from '@/components/queries/queries';
import { useMutation } from '@apollo/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function DeleteListingPage() {
  const router = useRouter();
  const id = useSearchParams().get('id');
  const [deleteUser] = useMutation(DELETE_USER);
  const showToast = useToast();

  const handleSubmit = async () => {
    try {
      await deleteUser({
        variables: {
          id,
        },
      });
      showToast('Lamentamos que te hayas ido :(');
      router.push('/');
    } catch (error) {
      showToast(
        `Hubo un problema al tratar de eliminar este usuario: ${error}`,
        'error',
      );
      console.error('Error deleting user:', error);
    }
  };
  return (
    <div className="modal-container">
      <h4>¿Estás seguro que querés eliminar esta cuenta?</h4>
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
          Eliminar cuenta
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <DeleteListingPage />
    </Suspense>
  );
}
