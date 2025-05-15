import { Event } from '../../types';

const 초 = 1000;
const 분 = 초 * 60;

/**
 * 알림 시간이 정확히 도래한 이벤트를 반환
 * @param events
 * @param now
 * @param notifiedEvents
 * @returns
 */
export function getUpcomingEvents(events: Event[], now: Date, notifiedEvents: string[]) {
  return events.filter((event) => {
    const eventStart = new Date(`${event.date}T${event.startTime}`);
    const timeDiff = (eventStart.getTime() - now.getTime()) / 분;
    return timeDiff > 0 && timeDiff <= event.notificationTime && !notifiedEvents.includes(event.id);
  });
}

/**
 * 올바른 알림 메시지를 생성
 * @param param0
 * @returns
 */
export function createNotificationMessage({ notificationTime, title }: Event) {
  return `${notificationTime}분 후 ${title} 일정이 시작됩니다.`;
}
