import { fillZero } from '../shared/lib/dateUtils';

/**
 *
 * @param date1
 * @param date2
 */
export const assertDate = (date1: Date, date2: Date) => {
  expect(date1.toISOString()).toBe(date2.toISOString());
};

/**
 *
 * @param timestamp
 * @returns
 */
export const parseHM = (timestamp: number) => {
  const date = new Date(timestamp);
  const h = fillZero(date.getHours());
  const m = fillZero(date.getMinutes());
  return `${h}:${m}`;
};
