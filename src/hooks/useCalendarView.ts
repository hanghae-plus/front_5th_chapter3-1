import { useEffect, useState } from 'react';

import { fetchHolidays } from '../apis/fetchHolidays';
import { useAtom } from 'jotai';
import { calanderViewAtom } from '../state/calancerViewAtom';

export const useCalendarView = () => {
  const [calanderView, setCalanderView] = useAtom(calanderViewAtom);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [holidays, setHolidays] = useState<{ [key: string]: string }>({});

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (calanderView === 'week') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      } else if (calanderView === 'month') {
        newDate.setDate(1); // 항상 1일로 설정
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      }
      return newDate;
    });
  };

  useEffect(() => {
    setHolidays(fetchHolidays(currentDate));
  }, [currentDate]);

  return { currentDate, setCurrentDate, holidays, navigate, calanderView, setCalanderView };
};
