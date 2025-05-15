import { useMemo } from 'react';

import { getWeekDates } from '@/shared/lib/dateUtils';

export const useWeekDates = (currentDate: Date) => {
  return useMemo(() => getWeekDates(currentDate), [currentDate]);
};
