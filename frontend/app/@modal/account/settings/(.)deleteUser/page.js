'use client';

import { useAuth } from '@/components/AuthContext';
import ModalDialog from '@/components/ModalDialog';
import { useToast } from '@/components/ToastContext';
import { DELETE_USER } from '@/components/queries/queries';
import { useMutation } from '@apollo/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function DeleteUserModal() {
  const { logout } = useAuth();
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
      logout();
    } catch (error) {
      showToast(
        `Hubo un problema al tratar de eliminar este usuario: ${error}`,
        'error',
      );
      console.error('Error deleting user:', error);
    }
  };
  return (
    <ModalDialog
      title="¿Estás seguro que querés eliminar esta cuenta?"
      buttonText="Eliminar cuenta"
      handleSubmit={handleSubmit}
    ></ModalDialog>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <DeleteUserModal />
    </Suspense>
  );
}
