export default function Select({
  name,
  placeholder,
  options,
  onChange,
  value,
  keyName,
}) {
  return (
    <>
      <select
        className="popover-button small required"
        name={name}
        id={name}
        placeholder={placeholder}
        onChange={onChange}
        value={value}
      >
        <button>
          <selectedcontent></selectedcontent>
          <span className="arrow"></span>
        </button>
        <option value="" hidden>
          <span>{placeholder}</span>
        </option>
        {options?.length > 0 ? (
          options.map((option, i) => (
            <option key={i} value={option[keyName]} data-id={option.id || null}>
              {option[keyName]}
            </option>
          ))
        ) : (
          <option>{placeholder}</option>
        )}
      </select>
    </>
  );
}
