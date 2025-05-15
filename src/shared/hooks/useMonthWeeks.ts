// useMonthWeeks(currentDate) → 주차 계산 최적화

import { useMemo } from 'react';

import { getWeeksAtMonth } from '@/shared/lib/dateUtils';

export const useMonthWeeks = (currentDate: Date) => {
  return useMemo(() => getWeeksAtMonth(currentDate), [currentDate]);
};
