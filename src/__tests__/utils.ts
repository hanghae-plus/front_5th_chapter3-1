import { Event } from '../types';
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

/**
 * 이벤트의 알림 상태에 알맞는 스타일을 반환
 */
export const getEventStyles = (
  event: Event,
  notifiedEvents: string[]
): {
  bg: string;
  fontWeight: string;
  color: string;
} => {
  const isNotified = notifiedEvents.includes(event.id);
  return {
    bg: isNotified ? 'red.100' : 'gray.100',
    fontWeight: isNotified ? 'bold' : 'normal',
    color: isNotified ? 'red.500' : 'inherit',
  };
};

/**
 * 알림 시간(분) 값에 대한 라벨을 반환
 */
export const getNotificationLabel = (
  notificationTime: number,
  options: Array<{ value: number; label: string }>
): string => {
  const option = options.find((opt) => opt.value === notificationTime);
  return option ? option.label : `${notificationTime}분 전`;
};
