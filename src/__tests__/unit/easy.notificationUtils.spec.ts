import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const events: Event[] = [
    {
      id: 'event1',
      date: '2025-05-01',
      startTime: '10:00',
      endTime: '11:00',
      notificationTime: 30,
    } as Event,
    {
      id: 'event2',
      date: '2025-05-01',
      startTime: '12:00',
      endTime: '14:00',
      notificationTime: 30,
    } as Event,
  ];
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-05-01T09:30:00');

    const upcomingEvents = getUpcomingEvents(events, now, []);

    expect(upcomingEvents).toEqual([events[0]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-05-01T11:30:00');
    const upcomingEvents = getUpcomingEvents(events, now, ['event1']);
    expect(upcomingEvents).toEqual([events[1]]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-05-01T11:29:00');
    const upcomingEvents = getUpcomingEvents(events, now, ['event1']);
    expect(upcomingEvents).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-05-01T11:31:00');
    const upcomingEvents = getUpcomingEvents(events, now, ['event1', 'event2']);
    expect(upcomingEvents).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = {
      notificationTime: 30,
      title: 'event 1',
    } as Event;

    const message = createNotificationMessage(event);

    expect(message).toEqual('30분 후 event 1 일정이 시작됩니다.');
  });
});
