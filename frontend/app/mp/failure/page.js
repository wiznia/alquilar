'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Failure() {
  const router = useRouter();
  const { error } = router.query;

  useEffect(() => {
    setTimeout(() => {
      window.close();
    }, 5000);
  }, [error]);

  return (
    <div>
      <p>Connection failed: {error}. You can close this window.</p>
    </div>
  );
}
