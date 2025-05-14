import { Event } from '../entities/event/model/types';
import { fillZero } from '../shared/utils/dateUtils';

export const assertDate = (date1: Date, date2: Date) => {
  expect(date1.toISOString()).toBe(date2.toISOString());
};

export const parseHM = (timestamp: number) => {
  const date = new Date(timestamp);
  const h = fillZero(date.getHours());
  const m = fillZero(date.getMinutes());
  return `${h}:${m}`;
};

// 테스트용 이벤트 생성 헬퍼 함수
export const createEvent = (
  id: string,
  date: string,
  startTime: string,
  endTime: string
): Event => ({
  id,
  title: '테스트 이벤트',
  date,
  startTime,
  endTime,
  description: '',
  location: '',
  category: '',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 10,
});
