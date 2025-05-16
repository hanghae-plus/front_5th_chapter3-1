import { fillZero } from '../utils/dateUtils';
import { Event } from '../types';
/**
 * 두 날짜가 같은지 확인합니다.
 */
export const assertDate = (date1: Date, date2: Date) => {
  expect(date1.toISOString()).toBe(date2.toISOString());
};

/**
 * 주어진 타임스탬프를 시간과 분으로 파싱합니다.
 */
export const parseHM = (timestamp: number) => {
  const date = new Date(timestamp);
  const h = fillZero(date.getHours());
  const m = fillZero(date.getMinutes());
  return `${h}:${m}`;
};

export const assertDates = (dates1: (number | null)[], dates2: (number | null)[]) => {
  expect(dates1).toMatchObject(dates2);
};

export const assertEvents = (events1: Event[], events2: Event[]) => {
  expect(events1).toMatchObject(events2);
};
