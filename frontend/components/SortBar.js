import { useContext } from 'react';
import Popover from './Popover';
import { AppContext } from '../pages/listings';

export default function SortBar() {
  const { data } = useContext(AppContext);
  const { count } = data.getListings;
  const orderMenu = [
    {
      name: 'ordenar_por',
      options: [
        { label: 'Menor precio', value: 'precio_ASC' },
        { label: 'Mayor precio', value: 'precio_DESC' },
        { label: 'Más recientes', value: 'createdAt_DESC' },
        { label: 'Más vistos', value: 'viewCount_DESC' },
      ],
    },
  ];
  return (
    <div className="sort-bar">
      <h6>
        {count} departamento
        {count > 1 || count === 0 ? 's' : ''} en Buenos Aires
      </h6>
      {orderMenu.map((field) => (
        <Popover key={field.name} props={field} />
      ))}
    </div>
  );
}
