import React, { useEffect, useRef, useState } from 'react';

const Autocomplete = ({ options = [], value, placeholder, onChange }) => {
  const autocomplete = useRef();

  const [optionsData, setOptionsData] = useState([]);
  const [query, setQuery] = useState(value);
  const [isShow, setIsShow] = useState(false);

  const handleInputChange = (v) => {
    setQuery(v);
    onChange(v);
    v === ''
      ? setOptionsData([])
      : setOptionsData([
          ...options.filter(
            (x) => x.toLowerCase().indexOf(v.toLowerCase()) > -1,
          ),
        ]);
  };

  const handleClickOutSide = (e) => {
    if (!autocomplete.current.contains(e.target)) {
      setIsShow(false);
    }
  };

  const highlightSearchText = (text) => {
    var pattern = new RegExp('(' + query + ')', 'gi');
    var new_text = text.replace(pattern, `<b>${query}</b>`);
    return new_text;
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutSide);
    return () => {
      document.removeEventListener('mousedown', handleClickOutSide);
    };
  }, []);

  useEffect(() => {
    optionsData.length !== 0 ? setIsShow(true) : setIsShow(false);
  }, [optionsData]);

  return (
    <div className="search-container" ref={autocomplete}>
      <input
        className="p"
        type="search"
        placeholder={placeholder}
        issearch="true"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
      />
      {isShow && (
        <div className="autocomplete">
          {optionsData.map((x, index) => (
            <div
              className="autocomplete__item"
              onClick={() => {
                setQuery(x);
                setIsShow(false);
                onChange(x);
              }}
              key={index}
            >
              {
                <div
                  dangerouslySetInnerHTML={{ __html: highlightSearchText(x) }}
                />
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Autocomplete;
