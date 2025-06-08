import { Event } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const MOCK_EVENT: Event = {
  id: '1',
  title: '1번 이벤트',
  date: formatDate(new Date()),
  startTime: '10:00',
  endTime: '11:00',
  description: '1번 이벤트 설명',
  location: '1번 이벤트 장소',
  category: '1번 이벤트 카테고리',
  repeat: {
    type: 'none',
    interval: 0,
  },
  notificationTime: 0,
};

describe('getUpcomingEvents', () => {
  const NOTIFICATION_TIME_MINUTES = 10;
  const padTime = (n: number) => String(n).padStart(2, '0');

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date();
    const notificationTime = new Date(now.getTime() + NOTIFICATION_TIME_MINUTES * 60 * 1000);
    const startTime = `${padTime(notificationTime.getHours())}:${padTime(notificationTime.getMinutes())}`;

    const eventWithNotification = {
      ...MOCK_EVENT,
      notificationTime: NOTIFICATION_TIME_MINUTES,
      startTime,
    };
    const result = getUpcomingEvents([eventWithNotification], new Date(), []);

    expect(result).toEqual([eventWithNotification]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date();
    const pastNotificationTime = new Date(
      now.getTime() + (NOTIFICATION_TIME_MINUTES + 1) * 60 * 1000
    );
    const startTime = `${padTime(pastNotificationTime.getHours())}:${padTime(pastNotificationTime.getMinutes())}`;

    const eventWithPastNotification = {
      ...MOCK_EVENT,
      notificationTime: NOTIFICATION_TIME_MINUTES,
      startTime,
    };
    const result = getUpcomingEvents([eventWithPastNotification], now, [
      eventWithPastNotification.id,
    ]);

    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date();
    const futureNotificationTime = new Date(
      now.getTime() - (NOTIFICATION_TIME_MINUTES + 1) * 60 * 1000
    );
    const startTime = `${padTime(futureNotificationTime.getHours())}:${padTime(futureNotificationTime.getMinutes())}`;

    const eventWithFutureNotification = {
      ...MOCK_EVENT,
      notificationTime: NOTIFICATION_TIME_MINUTES,
      startTime,
    };
    const result = getUpcomingEvents([eventWithFutureNotification], now, []);

    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date();
    const pastNotificationTime = new Date(
      now.getTime() + (NOTIFICATION_TIME_MINUTES + 1) * 60 * 1000
    );
    const startTime = `${padTime(pastNotificationTime.getHours())}:${padTime(pastNotificationTime.getMinutes())}`;

    const eventWithPastNotification = {
      ...MOCK_EVENT,
      notificationTime: NOTIFICATION_TIME_MINUTES,
      startTime,
    };
    const result = getUpcomingEvents([eventWithPastNotification], now, []);

    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const result = createNotificationMessage(MOCK_EVENT);

    expect(result).toBe(
      `${MOCK_EVENT.notificationTime}분 후 ${MOCK_EVENT.title} 일정이 시작됩니다.`
    );
  });
});
