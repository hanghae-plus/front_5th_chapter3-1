import { Event } from '../..//entities/event/model/types';

/**
 * 📆 날짜 포맷 관련 유틸
 */
const dateFormat = {
  fillZero(value: number, size = 2): string {
    return String(value).padStart(size, '0');
  },

  formatDate(currentDate: Date, day?: number): string {
    return [
      currentDate.getFullYear(),
      dateFormat.fillZero(currentDate.getMonth() + 1),
      dateFormat.fillZero(day ?? currentDate.getDate()),
    ].join('-');
  },

  formatMonth(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}년 ${month}월`;
  },

  formatWeek(targetDate: Date): string {
    const dayOfWeek = targetDate.getDay();
    const diffToThursday = 4 - dayOfWeek;
    const thursday = new Date(targetDate);
    thursday.setDate(targetDate.getDate() + diffToThursday);

    const year = thursday.getFullYear();
    const month = thursday.getMonth() + 1;

    const firstDayOfMonth = new Date(year, thursday.getMonth(), 1);
    const firstThursday = new Date(firstDayOfMonth);
    firstThursday.setDate(1 + ((4 - firstDayOfMonth.getDay() + 7) % 7));

    const weekNumber =
      Math.floor((thursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

    return `${year}년 ${month}월 ${weekNumber}주`;
  },
};

/**
 * 📅 날짜 계산 관련 유틸
 */
const dateCalc = {
  getDaysInMonth(year: number, month: number): number {
    if (month < 1 || month > 12) return 0;
    return new Date(year, month, 0).getDate();
  },

  getWeekDates(date: Date): Date[] {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const sunday = new Date(date.setDate(diff));
    return Array.from({ length: 7 }, (_, i) => {
      const nextDate = new Date(sunday);
      nextDate.setDate(sunday.getDate() + i);
      return nextDate;
    });
  },

  getWeeksAtMonth(currentDate: Date): Array<(number | null)[]> {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = dateCalc.getDaysInMonth(year, month + 1);
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const initWeek = () => Array(7).fill(null);
    let week = initWeek();
    const weeks = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      week[i] = null;
    }

    for (const day of days) {
      const dayIndex = (firstDayOfMonth + day - 1) % 7;
      week[dayIndex] = day;
      if (dayIndex === 6 || day === daysInMonth) {
        weeks.push(week);
        week = initWeek();
      }
    }

    return weeks;
  },
};

/**
 * 🔍 날짜 조건 필터 유틸
 */
const dateFilter = {
  isDateInRange(date: Date, start: Date, end: Date): boolean {
    return date >= start && date <= end;
  },

  getEventsForDay(events: Event[], date: number): Event[] {
    return events.filter((event) => new Date(event.date).getDate() === date);
  },
};

// ✅ 외부로 export - 기존 테스트 코드와 호환 유지
export const fillZero = dateFormat.fillZero;
export const formatDate = dateFormat.formatDate;
export const formatMonth = dateFormat.formatMonth;
export const formatWeek = dateFormat.formatWeek;

export const getDaysInMonth = dateCalc.getDaysInMonth;
export const getWeekDates = dateCalc.getWeekDates;
export const getWeeksAtMonth = dateCalc.getWeeksAtMonth;

export const isDateInRange = dateFilter.isDateInRange;
export const getEventsForDay = dateFilter.getEventsForDay;

// ✅ 내부적으로는 그룹화된 모듈도 같이 export (원할 경우)
export const calendarUtils = {
  ...dateFormat,
  ...dateCalc,
  ...dateFilter,
};
