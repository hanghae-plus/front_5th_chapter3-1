import { Event } from '../types';

const 초 = 1000;
const 분 = 초 * 60;

/**
 * 주어진 날짜, 시간에 발생할 이벤트 중에서 알림 조건을 만족하는 이벤트를 필터링합니다.
 * 1. 이벤트 시작 시간까지 남은 시간이 알림 시간(notificationTime)과 일치하는 경우
 * 2. 이미 알림이 발생한 이벤트는 제외
 */
export function getUpcomingEvents(events: Event[], now: Date, notifiedEvents: string[]) {
  return events.filter((event) => {
    const eventDate = new Date(`${event.date}T${event.startTime}`);
    
    // 이벤트 시작 시간 - 현재 시간 (분 단위)
    const timeDifferenceInMinutes = Math.round((eventDate.getTime() - now.getTime()) / 분);
    
    // 정확한 알림 조건 평가
    // 1. 시간 차이가 알림 시간과 정확히 일치 (약간의 오차 허용)
    // 2. 아직 알림을 받지 않은 이벤트
    return (
      timeDifferenceInMinutes >= 0 &&
      Math.abs(timeDifferenceInMinutes - event.notificationTime) < 0.5 &&
      !notifiedEvents.includes(event.id)
    );
  });
}

/**
 * 이벤트 정보를 받아 알림 메시지를 생성합니다.
 */
export function createNotificationMessage({ notificationTime, title }: Event) {
  return `${notificationTime}분 후 ${title} 일정이 시작됩니다.`;
}
