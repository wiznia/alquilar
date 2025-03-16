'use client';

import { GET_USER } from '@/components/queries/queries';
import { useQuery } from '@apollo/client';

export default function Account() {
  const { data, loading, error } = useQuery(GET_USER);

  if (loading) {
    return (
      <div className="loading">
        <h4>Cargando datos...</h4>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading">
        <p>Hubo un problema al cargar tu cuenta: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Mi Cuenta</h1>
      <p>
        <strong>Usuario:</strong> {data.user.usuario}
      </p>
      <p>
        <strong>Nombre:</strong> {data.user.nombre} {data.user.apellido}
      </p>
      <p>
        <strong>Email:</strong> {data.user.email}
      </p>
      <p>
        <strong>Tipo de Cuenta:</strong> {data.user.tipo_de_cuenta}
      </p>
    </div>
  );
}
