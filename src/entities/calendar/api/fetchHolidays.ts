import { HOLIDAY_RECORD } from '@/entities/calendar/config/constants';

type HolidayRecord = typeof HOLIDAY_RECORD;
type HolidayKeys = keyof HolidayRecord;

export function fetchHolidays(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const holidays = Object.keys(HOLIDAY_RECORD) as HolidayKeys[];
  return holidays
    .filter((date) => date.includes(`${y}-${m}`))
    .reduce(
      (acc: Partial<HolidayRecord>, date) => ({
        ...acc,
        [date]: HOLIDAY_RECORD[date],
      }),
      {}
    );
}
