import { Event } from '../types';

const 초 = 1000;
const 분 = 초 * 60;

/**
 * 알림 시간이 지나지 않은 이벤트를 반환합니다.
 *
 * @example
 * getUpcomingEvents(events, new Date('2025-07-01'), ['event1', 'event2'])
 * // [
 * //   { id: 'event3', date: '2025-07-01', startTime: '10:00', notificationTime: 10 },
 * // ]
 */
export const getUpcomingEvents = (events: Event[], now: Date, notifiedEvents: string[]) => {
  return events.filter((event) => {
    const eventStart = new Date(`${event.date}T${event.startTime}`);
    const timeDiff = (eventStart.getTime() - now.getTime()) / 분;
    return timeDiff > 0 && timeDiff <= event.notificationTime && !notifiedEvents.includes(event.id);
  });
};

/**
 * 알림 메시지를 생성합니다.
 *
 * @example
 * createNotificationMessage({ notificationTime: 10, title: '이벤트 1' })
 * // '10분 후 이벤트 1 일정이 시작됩니다.'
 */
export const createNotificationMessage = ({ notificationTime, title }: Event) => {
  return `${notificationTime}분 후 ${title} 일정이 시작됩니다.`;
};
