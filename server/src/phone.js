/** Нормализация телефона для хранения (цифры, приоритет E.164-подобный). */
export function normalizePhone(raw) {
  if (raw == null || typeof raw !== 'string') return '';
  const d = raw.replace(/\D/g, '');
  if (d.length < 10) return '';
  if (d.length === 11 && d.startsWith('8')) return `7${d.slice(1)}`;
  if (d.length === 10) return `7${d}`;
  return d.slice(-11).length === 11 ? d.slice(-11) : d;
}
