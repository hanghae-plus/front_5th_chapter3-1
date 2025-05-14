import { useEffect, useState } from 'react';

import { fetchHolidays } from '../apis/fetchHolidays';
import { getNextWeekDate, getNextMonthDate } from '../utils/dateUtils';

export const useCalendarView = () => {
  const [view, setView] = useState<'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<{ [key: string]: string }>({});

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (view === 'week') {
        return getNextWeekDate(prevDate, direction);
      } else if (view === 'month') {
        return getNextMonthDate(prevDate, direction);
      }
      return newDate;
    });
  };

  useEffect(() => {
    setHolidays(fetchHolidays(currentDate));
  }, [currentDate]);

  return { view, setView, currentDate, setCurrentDate, holidays, navigate };
};
