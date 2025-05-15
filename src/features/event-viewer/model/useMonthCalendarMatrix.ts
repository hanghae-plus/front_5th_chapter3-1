// currentDate와 holidays 기반
// 월간 주차 데이터 + 날짜 포맷 + 공휴일 정보를 포함한 매트릭스를 만들어주는 역할

import { useMemo } from 'react';

import { formatDate, getWeeksAtMonth } from '../../../shared/lib/dateUtils';

export interface DayCell {
  day: number | null;
  dateString: string | null;
  holiday: string | null;
}

export function useMonthCalendarMatrix(
  currentDate: Date,
  holidays: Record<string, string>
): DayCell[][] {
  return useMemo(() => {
    const weeks = getWeeksAtMonth(currentDate);

    return weeks.map((week) =>
      week.map((day) => {
        if (!day) return { day: null, dateString: null, holiday: null };

        const dateString = formatDate(currentDate, day);
        return {
          day,
          dateString,
          holiday: holidays[dateString] ?? null,
        };
      })
    );
  }, [currentDate, holidays]);
}
