import { Event } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const MOCK_EVENTS: Event = {
  id: '1',
  title: '이벤트',
  description: '이벤트 설명',
  date: formatDate(new Date()),
  startTime: '14:30',
  endTime: '15:30',
  location: '이벤트 장소',
  category: '이벤트 카테고리',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 0,
};

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const ALARM_TIME = 10;
    const now = new Date();
    const tenMinutesLater = new Date(now.getTime() + ALARM_TIME * 60 * 1000);

    const pad = (n: number) => String(n).padStart(2, '0');
    const startTime = `${pad(tenMinutesLater.getHours())}:${pad(tenMinutesLater.getMinutes())}`;

    const UPCOMING_EVENTS = {
      ...MOCK_EVENTS,
      notificationTime: ALARM_TIME,
      startTime,
    };
    const result = getUpcomingEvents([UPCOMING_EVENTS], new Date(), []);
    expect(result).toEqual([UPCOMING_EVENTS]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const ALARM_TIME = 10;
    const now = new Date();
    const GONE_TIME = new Date(now.getTime() + (ALARM_TIME + 1) * 60 * 1000);

    const pad = (n: number) => String(n).padStart(2, '0');
    const startTime = `${pad(GONE_TIME.getHours())}:${pad(GONE_TIME.getMinutes())}`;

    const UPCOMING_EVENTS = {
      ...MOCK_EVENTS,
      notificationTime: ALARM_TIME,
      startTime,
    };
    const result = getUpcomingEvents([UPCOMING_EVENTS], now, [UPCOMING_EVENTS.id]);

    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const ALARM_TIME = 10;
    const now = new Date();
    const NOT_COME_TIME = new Date(now.getTime() - (ALARM_TIME + 1) * 60 * 1000);

    const pad = (n: number) => String(n).padStart(2, '0');
    const startTime = `${pad(NOT_COME_TIME.getHours())}:${pad(NOT_COME_TIME.getMinutes())}`;

    const UPCOMING_EVENTS = {
      ...MOCK_EVENTS,
      notificationTime: ALARM_TIME,
      startTime,
    };
    const result = getUpcomingEvents([UPCOMING_EVENTS], now, []);
    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const ALARM_TIME = 10;
    const now = new Date();
    const GONE_TIME = new Date(now.getTime() + (ALARM_TIME + 1) * 60 * 1000);

    const pad = (n: number) => String(n).padStart(2, '0');
    const startTime = `${pad(GONE_TIME.getHours())}:${pad(GONE_TIME.getMinutes())}`;

    const UPCOMING_EVENTS = {
      ...MOCK_EVENTS,
      notificationTime: ALARM_TIME,
      startTime,
    };
    const result = getUpcomingEvents([UPCOMING_EVENTS], now, []);

    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const result = createNotificationMessage(MOCK_EVENTS);
    expect(result).toBe(
      `${MOCK_EVENTS.notificationTime}분 후 ${MOCK_EVENTS.title} 일정이 시작됩니다.`
    );
  });
});
