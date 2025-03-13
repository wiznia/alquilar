'use client';

import { useRouter } from 'next/navigation';

export default function Modal({ children }) {
  const router = useRouter();
  const handleOpenChange = () => {
    router.back();
  };
  return (
    <dialog defaultOpen={true} open={true} onOpenChange={handleOpenChange}>
      {children}
    </dialog>
  );
}
