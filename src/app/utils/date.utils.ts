/**
 * Конвертирует локальный Date в ISO строку с учётом часового пояса браузера.
 * Формат: YYYY-MM-DDTHH:mm:ss±HH:mm (например: 2024-01-15T10:30:00+03:00)
 * Этот формат совместим с .NET DateTimeOffset.
 */
export function toLocalISOString(date: Date): string {
  const offset = -date.getTimezoneOffset(); // offset в минутах (отрицательный, потому что getTimezoneOffset возвращает разницу в минутах между UTC и локальным временем)
  const offsetSign = offset >= 0 ? '+' : '-';
  const offsetHours = Math.abs(Math.floor(offset / 60))
    .toString()
    .padStart(2, '0');
  const offsetMinutes = Math.abs(offset % 60)
    .toString()
    .padStart(2, '0');

  // Получаем локальную дату/время в ISO формате (без Z)
  const localISO = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, -1);

  return `${localISO}${offsetSign}${offsetHours}:${offsetMinutes}`;
}

/**
 * Парсит значение из input type="datetime-local" в Date.
 * Возвращает null если значение пустое или невалидное.
 */
export function parseDateTimeLocal(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  // Формат datetime-local: "YYYY-MM-DDTHH:mm"
  // Добавляем секунды ":00" для полной ISO строки
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}