import { fillZero } from '../utils/dateUtils';

export const assertDate = (date1: Date, date2: Date) => {
  expect(date1.toISOString()).toBe(date2.toISOString());
};

export const parseHM = (timestamp: number) => {
  const date = new Date(timestamp);
  const h = fillZero(date.getHours());
  const m = fillZero(date.getMinutes());
  return `${h}:${m}`;
};

export const WEEKDAY_INDEX = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

export type WeekDayIndex = (typeof WEEKDAY_INDEX)[keyof typeof WEEKDAY_INDEX];

// 테스트 헬퍼 함수로 만들었으나, 해당 함수 조차도 테스트를 해야하는 가?
export function getThisWeeksDay(targetDay: WeekDayIndex, baseDate: string = '') {
  const now = baseDate ? new Date(baseDate) : new Date();
  const diff = now.getDate() - now.getDay() + targetDay;
  return new Date(now.setDate(diff));
}
