'use client';

import { useEffect } from 'react';

export default function Success() {
  useEffect(() => {
    setTimeout(() => {
      window.close();
    }, 3000);
  }, []);

  return (
    <div>
      <p>
        Conectaste tu cuenta de Mercado Pago! esta ventana se cerrará en 3
        segundos.
      </p>
    </div>
  );
}
