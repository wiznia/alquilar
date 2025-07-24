import { useRouter } from 'next/navigation';
import { Modal } from './Modal';

export default function ModalDialog({
  handleSubmit = null,
  title,
  buttonText,
}) {
  const router = useRouter();

  return (
    <Modal className="dialog--small">
      <h4>{title}</h4>
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
          {buttonText}
        </button>
      </div>
    </Modal>
  );
}
