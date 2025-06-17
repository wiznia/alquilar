export default function formatMoney(amount = 0, moneda = 'Pesos') {
  const options = {
    style: 'currency',
    currency: moneda === 'Pesos' ? 'ARS' : 'USD',
    minimumFractionDigits: 2,
  };

  if (amount % 100 === 0) {
    options.minimumFractionDigits = 0;
  }

  const formatter = Intl.NumberFormat('es-AR', options);

  return formatter.format(amount);
}
