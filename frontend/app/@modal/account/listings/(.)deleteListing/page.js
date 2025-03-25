import { Modal } from '@/components/Modal';

export default function DeleteListingModal() {
  return (
    <Modal>
      <h4>¿Estás seguro que querés eliminar esta publicación?</h4>
      <div className="button-container">
        <button className="button button--secondary">Cancelar</button>
        <button className="button button--danger">Eliminar</button>
      </div>
    </Modal>
  );
}
