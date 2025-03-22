export default function Select({ name, placeholder, options, onChange }) {
  return (
    <>
      <select
        className="popover-button small"
        name={name}
        id={name}
        placeholder={placeholder}
        required
        onChange={onChange}
      >
        <button>
          <selectedcontent></selectedcontent>
          <span className="arrow"></span>
        </button>
        <option value="" hidden>
          <span>{placeholder}</span>
        </option>
        {options?.length > 0 ? (
          options.map((option, i) => <option key={i}>{option.nombre}</option>)
        ) : (
          <option>{placeholder}</option>
        )}
      </select>
    </>
  );
}
