import eventsData from '../../__mocks__/response/events.json';
import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const events = eventsData.events as Event[];
    const now = new Date('2025-07-01T08:50:00');
    const notifiedEvents = [] as string[];
    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toEqual([events[0]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events = eventsData.events as Event[];
    const now = new Date('2025-07-01T08:50:00');
    const notifiedEvents = [events[0].id] as string[];
    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events = eventsData.events as Event[];
    const now = new Date('2025-07-01T08:40:00');
    const notifiedEvents = [] as string[];
    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events = eventsData.events as Event[];
    const now = new Date('2025-07-01T09:00:00');
    const notifiedEvents = [] as string[];
    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = eventsData.events[0] as Event;
    const result = createNotificationMessage(event);
    expect(result).toBe('10분 후 이벤트 1 일정이 시작됩니다.');
  });
});
