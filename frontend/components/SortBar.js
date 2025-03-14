import Popover from './Popover';
import { useAppContext } from './AppContext';

export default function SortBar({ count: searchCount }) {
  const { data } = useAppContext();
  const count = data?.getListings?.count || 0;
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
      {count > 0 && !searchCount ? (
        <h6>
          {count} departamento
          {count > 1 || count === 0 ? 's' : ''} en Buenos Aires
        </h6>
      ) : (
        <h6>
          {searchCount} departamento
          {searchCount > 1 || searchCount === 0 ? 's' : ''} en Buenos Aires
        </h6>
      )}
      {orderMenu.map((field) => (
        <Popover key={field.name} props={field} />
      ))}
    </div>
  );
}
