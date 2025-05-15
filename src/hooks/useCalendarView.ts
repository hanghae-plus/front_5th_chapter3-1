import { useEffect, useState } from 'react';

import { fetchHolidays } from '../apis/fetchHolidays';
import { getNavigatedDate } from '../utils/dateUtils';

export const useCalendarView = () => {
  const [view, setView] = useState<'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<{ [key: string]: string }>({});

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate((prevDate) => getNavigatedDate(prevDate, view, direction));
  };

  useEffect(() => {
    setHolidays(fetchHolidays(currentDate));
  }, [currentDate]);

  return { view, setView, currentDate, setCurrentDate, holidays, navigate };
};
