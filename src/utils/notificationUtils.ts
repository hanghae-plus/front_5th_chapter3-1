import { Event } from '../types';

const 초 = 1000;
const 분 = 초 * 60;

/**
 *
 * @param events
 * @param now
 * @param notifiedEvents 이미 알림 보낸 이벤트 ID 배열
 * @returns
 */
export function getUpcomingEvents(events: Event[], now: Date, notifiedEvents: string[]) {
  return events.filter((event) => {
    const eventStart = new Date(`${event.date}T${event.startTime}`);
    const timeDiff = (eventStart.getTime() - now.getTime()) / 분;
    return timeDiff > 0 && timeDiff <= event.notificationTime && !notifiedEvents.includes(event.id);
  });
}

export function createNotificationMessage({ notificationTime, title }: Event) {
  return `${notificationTime}분 후 ${title} 일정이 시작됩니다.`;
}
