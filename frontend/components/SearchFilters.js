import MoreFilters from './MoreFilters';
import Popover from './Popover';
import Search from './Search';

export default function SearchFilters() {
  const listingFields = [
    {
      name: 'tipo_de_alquiler',
      options: [
        {
          label: 'Alquiler temporario',
          value: 'Alquiler temporario',
        },
        {
          label: 'Alquiler',
          value: 'Alquiler',
        },
      ],
    },
    {
      name: 'tipo_de_propiedad',
      options: [
        {
          label: 'Departamento',
          value: 'Departamento',
        },
        {
          label: 'Casa',
          value: 'Casa',
        },
        {
          label: 'PH',
          value: 'PH',
        },
        {
          label: 'Otros',
          value: 'Otros',
        },
      ],
    },
    {
      name: 'moneda',
      options: [
        {
          label: 'Pesos',
          value: 'Pesos',
        },
        {
          label: 'Dólares',
          value: 'Dolares',
        },
      ],
    },
  ];

  const moreFilters = [
    {
      name: 'superficie_total',
      options: [],
    },
    {
      name: 'fecha_de_publicacion',
      options: [],
    },
    {
      name: 'antiguedad',
      options: [
        {
          label: 'A estrenar',
          value: 0,
        },
        {
          label: 'Hasta 5 años',
          value: 5,
        },
        {
          label: 'Hasta 10 años',
          value: 10,
        },
        {
          label: 'Hasta 20 años',
          value: 20,
        },
        {
          label: 'Hasta 30 años',
          value: 30,
        },
        {
          label: 'Hasta 40 años',
          value: 40,
        },
        {
          label: 'Hasta 50 años',
          value: 50,
        },
      ],
    },
    {
      name: 'tipo_de_ambientes',
      options: [
        {
          label: 'Balcón',
          value: 'Balcón',
        },
        {
          label: 'Jardín',
          value: 'Jardín',
        },
        {
          label: 'Patio',
          value: 'Patio',
        },
        {
          label: 'Terraza',
          value: 'Terraza',
        },
      ],
    },
    {
      name: 'ammenities',
      options: [
        {
          label: 'Gimnasio',
          value: 'Gimnasio',
        },
        {
          label: 'Lavadero',
          value: 'Lavadero',
        },
        {
          label: 'Parrilla',
          value: 'Parrilla',
        },
        {
          label: 'Pileta',
          value: 'Pileta',
        },
        {
          label: 'Quincho',
          value: 'Quincho',
        },
        {
          label: 'SUM',
          value: 'SUM',
        },
      ],
    },
  ];

  return (
    <div className="search-filters">
      <Search />
      {listingFields.map((field) => (
        <Popover key={field.name} props={field} />
      ))}
      <MoreFilters key="mas-filtros" props={moreFilters} />
    </div>
  );
}
