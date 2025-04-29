import { useState, useEffect } from 'react';
import { formatText } from '../config';
import { useListingsContext } from './ListingsContext';

export default function Popover({ props }) {
  const { updateListings, filterVariables, setSortBy, sortBy } =
    useListingsContext();
  const { name, options } = props;
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [orderText, setOrderText] = useState('Ordenar por');
  const anchorName = `--anchor-${name}`;
  const positionAnchor = `--anchor-${name}`;

  const initializeSelectedOptions = () => {
    const existingFilter = filterVariables[name] || [];

    setSelectedOptions(existingFilter);
  };

  const handleOptionChange = (optionValue, e) => {
    if (name === 'moneda') {
      setSelectedOptions([optionValue]);
    } else {
      setSelectedOptions((prevOptions) => {
        if (prevOptions.includes(optionValue)) {
          return prevOptions.filter((opt) => opt !== optionValue);
        }
        return [...prevOptions, optionValue];
      });

      if (name === 'ordenar_por') {
        const popover = e?.target.closest('.popover');
        const selectedOption = options.find(
          (option) => option.value === optionValue,
        );

        setSortBy(optionValue);
        setOrderText(selectedOption.label);
        popover?.hidePopover();
      }
    }
  };

  const clearFilters = (e) => {
    e.preventDefault();
    const popover = e.target.closest('.popover');
    popover.hidePopover();

    setSelectedOptions([]);
    setMinPrice('');
    setMaxPrice('');

    const newFilterVariables = { ...filterVariables };

    if (name === 'moneda') {
      delete newFilterVariables['precio_min'];
      delete newFilterVariables['precio_max'];
      updateListings(newFilterVariables, 'precio_min');
      updateListings(newFilterVariables, 'precio_max');
    }

    delete newFilterVariables[name];
    updateListings([], name);
  };

  const setFilters = (e) => {
    e.preventDefault();
    const popover = e.target.closest('.popover');
    let filters = [];

    if (name === 'moneda') {
      if (selectedOptions.length > 0) {
        filters.push(selectedOptions[0]);
      }
      if (minPrice !== '') {
        updateListings(parseInt(minPrice, 10) * 100, 'precio_min');
      }
      if (maxPrice !== '') {
        updateListings(parseInt(maxPrice, 10) * 100, 'precio_max');
      }
    } else {
      filters = selectedOptions;
    }

    popover.hidePopover();
    updateListings(filters, name);
  };

  useEffect(() => {
    initializeSelectedOptions();
  }, []);

  useEffect(() => {
    if (name === 'ordenar_por' && sortBy) {
      const selectedOption = options.find((option) => option.value === sortBy);
      if (selectedOption) {
        setOrderText(selectedOption.label);
      }
    }
  }, [sortBy, options, name]);

  useEffect(() => {
    if (name === 'moneda') {
      if (filterVariables['precio_min']) {
        setMinPrice((filterVariables['precio_min'] / 100).toString());
      }
      if (filterVariables['precio_max']) {
        setMaxPrice((filterVariables['precio_max'] / 100).toString());
      }
    }
  }, [filterVariables, name]);

  return (
    <div className="popover-container">
      <button
        type="button"
        className="popover-button"
        popoverTarget={name}
        style={{ anchorName }}
      >
        {name === 'ordenar_por' ? (
          <small>{orderText}</small>
        ) : (
          <small>{formatText(name)}</small>
        )}
        <span className="arrow" />
      </button>
      <div
        popover="auto"
        id={name}
        className="popover"
        style={{ positionAnchor }}
      >
        {options.map((option) => (
          <div className="popover__item" key={option.value}>
            <input
              name={name}
              type={name === 'moneda' ? 'radio' : 'checkbox'}
              id={option.value}
              checked={selectedOptions.includes(option.value)}
              onChange={() => handleOptionChange(option.value)}
              className={name === 'ordenar_por' ? 'popover__item--hidden' : ''}
              onClick={
                name === 'ordenar_por'
                  ? (e) => handleOptionChange(option.value, e)
                  : null
              }
            />
            <label htmlFor={option.value}>{option.label}</label>
          </div>
        ))}
        {name === 'moneda' && (
          <div className="button-container">
            <input
              type="number"
              min="0"
              placeholder="Desde"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
              type="number"
              min="0"
              placeholder="Hasta"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        )}
        {name !== 'ordenar_por' && (
          <div className="button-container">
            <button
              type="button"
              onClick={(e) => clearFilters(e)}
              className="button"
            >
              Limpiar
            </button>
            <button type="button" onClick={setFilters} className="button">
              Aplicar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
