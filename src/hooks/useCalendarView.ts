import { useEffect, useState } from 'react';

import { fetchHolidays } from '../apis/fetchHolidays';

/**
 * 캘린더 뷰 훅
 * @returns 캘린더 뷰 상태와 함수
 * view: 캘린더 뷰 타입
 * currentDate: 현재 날짜
 * holidays: 현재 날짜의 월에 속한 휴일
 * navigate: 날짜 이동
 */
export const useCalendarView = () => {
  const [view, setView] = useState<'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<{ [key: string]: string }>({});

  /**
   * 날짜 이동
   * @param direction - 이동 방향('prev' | 'next')
   */
  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (view === 'week') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      } else if (view === 'month') {
        newDate.setDate(1); // 항상 1일로 설정
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      }
      return newDate;
    });
  };

  useEffect(() => {
    setHolidays(fetchHolidays(currentDate));
  }, [currentDate]);

  return { view, setView, currentDate, setCurrentDate, holidays, navigate };
};
