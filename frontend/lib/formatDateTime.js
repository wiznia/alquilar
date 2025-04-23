export default function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(parseInt(dateString));
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      hour12: false,
      minute: '2-digit',
    });
  } else if (isYesterday) {
    return 'Ayer';
  } else {
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
    });
  }
}
