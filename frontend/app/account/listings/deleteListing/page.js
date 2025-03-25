export default function DeleteListingPage() {
  return (
    <div className="modal-container">
      <h5>¿Estás seguro que querés eliminar esta publicación?</h5>
      <button className="button button--secondary">Cancelar</button>
      <button className="button button--danger">Eliminar</button>
    </div>
  );
}
