/**
 * Вычисляет длительность простоя
 * @param startedAt - Дата и время начала простоя (ISO строка)
 * @param endedAt - Дата и время окончания простоя (ISO строка или null)
 * @returns Строка с длительностью в формате "Xч Yм"
 */
export function calculateDowntimeDuration(
  startedAt: string,
  endedAt: string | null,
): string {
  const startDate = new Date(startedAt);
  const endDate = endedAt ? new Date(endedAt) : new Date();

  if (isNaN(startDate.getTime())) {
    return '-';
  }

  const diffMs = endDate.getTime() - startDate.getTime();

  // Если дата окончания раньше даты начала - считаем как 0
  if (diffMs < 0) {
    return '0ч 0м';
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}ч ${minutes}м`;
}