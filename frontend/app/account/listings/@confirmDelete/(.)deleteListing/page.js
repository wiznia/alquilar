import { Modal } from '@/components/Modal';

export default function Page() {
  return (
    <Modal>
      <h5>¿Estás seguro que querés eliminar esta publicación?</h5>
      <button className="button button--secondary">Cancelar</button>
      <button className="button button--danger">Eliminar</button>
    </Modal>
  );
}
