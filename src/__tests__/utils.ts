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

export const getFollowing7Days = (startDate: Date) => {
  const year = startDate.getFullYear();
  const month = startDate.getMonth();
  const date = startDate.getDate();
  const dates = [];

  for (let i = 0; i < 7; i++) {
    dates.push(new Date(year, month, date + i));
  }

  return dates;
};
