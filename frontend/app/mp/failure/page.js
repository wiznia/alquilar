'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function Failure() {
  const error = useSearchParams().get('error');

  useEffect(() => {
    setTimeout(() => {
      window.close();
    }, 3000);
  }, [error]);

  return (
    <div>
      <p>Connection failed: {error}. You can close this window.</p>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Failure />
    </Suspense>
  );
}
