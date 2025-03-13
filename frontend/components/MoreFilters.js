import { useState, useEffect } from 'react';
import { useAppContext } from './AppContext';
import { formatText } from '../config';

export default function MoreFilters({ props }) {
  const { updateListings, filterVariables } = useAppContext();
  const [selectedOptions, setSelectedOptions] = useState({});
  const [minSuperficie, setMinSuperficie] = useState('');
  const [maxSuperficie, setMaxSuperficie] = useState('');
  const [antiguedad, setAntiguedad] = useState('');
  const [minFechaPublicacion, setMinFechaPublicacion] = useState('');
  const [maxFechaPublicacion, setMaxFechaPublicacion] = useState('');
  const anchorName = `--anchor-mas-filtros`;
  const positionAnchor = `--anchor-mas-filtros`;

  const initializeSelectedOptions = () => {
    const options = {};

    props.forEach((option) => {
      options[option.name] = filterVariables[option.name] || [];
    });
    setSelectedOptions(options);
  };

  const handleOptionChange = (optionValue, optionName, isRadio) => {
    setSelectedOptions((prevOptions) => {
      const updatedOptions = { ...prevOptions };

      if (isRadio) {
        updatedOptions[optionName] = [optionValue];
      } else {
        if (updatedOptions[optionName].includes(optionValue)) {
          updatedOptions[optionName] = updatedOptions[optionName].filter(
            (opt) => opt !== optionValue,
          );
        } else {
          updatedOptions[optionName] = [
            ...updatedOptions[optionName],
            optionValue,
          ];
        }
      }
      return updatedOptions;
    });
  };

  const clearFilters = (optionName) => {
    setSelectedOptions((prevOptions) => {
      const updatedOptions = { ...prevOptions, [optionName]: [] };
      return updatedOptions;
    });

    if (optionName === 'superficie_total') {
      setMinSuperficie('');
      setMaxSuperficie('');
      updateListings(null, 'superficie_total_min');
      updateListings(null, 'superficie_total_max');
    } else if (optionName === 'fecha_de_publicacion') {
      setMinFechaPublicacion('');
      setMaxFechaPublicacion('');
      updateListings(null, 'createdAt_min');
      updateListings(null, 'createdAt_max');
    } else if (optionName === 'antiguedad') {
      setAntiguedad('');
      updateListings([], 'antiguedad_max');
    }

    const newFilterVariables = { ...filterVariables };
    delete newFilterVariables[optionName];
    updateListings(newFilterVariables, optionName);
  };

  const setFilters = (optionName) => {
    const filters = selectedOptions[optionName];

    if (optionName === 'superficie_total') {
      if (minSuperficie !== '') {
        updateListings(parseInt(minSuperficie, 10), 'superficie_total_min');
      } else {
        updateListings(null, 'superficie_total_min');
      }
      if (maxSuperficie !== '') {
        updateListings(parseInt(maxSuperficie, 10), 'superficie_total_max');
      } else {
        updateListings(null, 'superficie_total_max');
      }
    } else if (optionName === 'fecha_de_publicacion') {
      updateListings(minFechaPublicacion, 'createdAt_min');
      updateListings(maxFechaPublicacion, 'createdAt_max');
    } else if (optionName === 'antiguedad') {
      updateListings(filters[0], 'antiguedad_max');
    } else {
      updateListings(filters, optionName);
    }

    setSelectedOptions((prevOptions) => ({
      ...prevOptions,
      [optionName]: filters,
    }));
  };

  useEffect(() => {
    props.forEach((option) => {
      if (option.name === 'superficie_total') {
        const minSuperficie = filterVariables.superficie_total_min;
        const maxSuperficie = filterVariables.superficie_total_max;
        if (minSuperficie) setMinSuperficie(minSuperficie);
        if (maxSuperficie) setMaxSuperficie(maxSuperficie);
      } else if (option.name === 'fecha_de_publicacion') {
        const minFechaPublicacion = filterVariables.createdAt_min;
        const maxFechaPublicacion = filterVariables.createdAt_max;
        if (minFechaPublicacion) setMinFechaPublicacion(minFechaPublicacion);
        if (maxFechaPublicacion) setMaxFechaPublicacion(maxFechaPublicacion);
      }
    });

    initializeSelectedOptions();
  }, []);

  return (
    <div className="popover-container mas-filtros">
      <button
        type="button"
        className="popover-button"
        popoverTarget="mas-filtros"
        style={{ anchorName }}
      >
        <small>Más filtros</small>
        <span className="arrow" />
      </button>
      <div
        popover="auto"
        id="mas-filtros"
        className="popover"
        style={{ positionAnchor }}
      >
        {Array.isArray(props) &&
          props.map((option, i) => (
            <div className="popover-isolated" key={i}>
              <h6 className="popover-title">{formatText(option.name)}</h6>
              <div
                className={
                  option.name === 'ammenities' ||
                  option.name === 'tipo_de_ambientes'
                    ? 'popover-column'
                    : ''
                }
              >
                {option.options.map((field) => (
                  <div className="popover__item" key={field.value}>
                    {option.name === 'antiguedad' ? (
                      <input
                        name={option.name}
                        type="radio"
                        id={field.value}
                        checked={
                          selectedOptions[option.name]?.[0] === field.value
                        }
                        onChange={() =>
                          handleOptionChange(field.value, option.name, true)
                        }
                      />
                    ) : (
                      <input
                        name={option.name}
                        type="checkbox"
                        id={field.value}
                        checked={
                          selectedOptions[option.name]?.includes(field.value) ||
                          false
                        }
                        onChange={() =>
                          handleOptionChange(field.value, option.name, false)
                        }
                      />
                    )}
                    <label htmlFor={field.value}>{field.label}</label>
                  </div>
                ))}
                {option.name === 'superficie_total' && (
                  <div className="button-container">
                    <input
                      type="number"
                      min="0"
                      placeholder="Desde"
                      value={minSuperficie}
                      onChange={(e) => setMinSuperficie(e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Hasta"
                      value={maxSuperficie}
                      onChange={(e) => setMaxSuperficie(e.target.value)}
                    />
                  </div>
                )}
                {option.name === 'fecha_de_publicacion' && (
                  <div className="button-container">
                    <input
                      type="date"
                      placeholder="Desde"
                      value={minFechaPublicacion}
                      onChange={(e) => {
                        setMinFechaPublicacion(e.target.value);
                      }}
                    />
                    <input
                      type="date"
                      placeholder="Hasta"
                      value={maxFechaPublicacion}
                      onChange={(e) => {
                        setMaxFechaPublicacion(e.target.value);
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="button-container">
                <button
                  type="button"
                  onClick={() => clearFilters(option.name)}
                  className="button"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={() => setFilters(option.name)}
                  className="button"
                >
                  Aplicar
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
