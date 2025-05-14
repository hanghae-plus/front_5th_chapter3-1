import { fillZero } from '../utils/dateUtils';

// 두 날짜가 같은지 확인
export const assertDate = (date1: Date, date2: Date) => {
  expect(date1.toISOString()).toBe(date2.toISOString());
};

// 시간을 HH:MM 형식으로 파싱
export const parseHM = (timestamp: number) => {
  const date = new Date(timestamp);
  const h = fillZero(date.getHours());
  const m = fillZero(date.getMinutes());
  return `${h}:${m}`;
};
