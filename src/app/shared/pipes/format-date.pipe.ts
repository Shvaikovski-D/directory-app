import { Pipe, PipeTransform } from '@angular/core';

/**
 * Форматирует дату и время в формат "ДД.ММ.ГГГГГ ЧЧ:мм"
 */
@Pipe({
  name: 'formatDate',
  standalone: true,
})
export class FormatDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return '-';
      }

      const formatter = new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      return formatter.format(date);
    } catch {
      return '-';
    }
  }
}
