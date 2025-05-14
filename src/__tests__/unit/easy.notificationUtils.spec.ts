import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { makeEvents } from '../utils';

describe('getUpcomingEvents', () => {
  const events = makeEvents(4).map((event, index) => ({
    ...event,
    id: `event${index + 1}`,
    date: new Date('2025-07-01').toISOString().split('T')[0],
    startTime: `10:0${index}`,
    endTime: `11:0${index}`,
  }));

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const upcomingEvents = getUpcomingEvents(events, new Date('2025-07-01 10:00'), []);

    expect(upcomingEvents).toStrictEqual(events.slice(1));
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const upcomingEvents = getUpcomingEvents(events, new Date('2025-07-01 10:00'), ['event1']);

    expect(upcomingEvents).toStrictEqual(events.slice(1));
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const upcomingEvents = getUpcomingEvents(events, new Date('2025-07-01 08:00'), []);

    expect(upcomingEvents).toStrictEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const upcomingEvents = getUpcomingEvents(events, new Date('2025-07-01 12:00'), []);

    expect(upcomingEvents).toStrictEqual([]);
  });
});

describe('createNotificationMessage', () => {
  const event = makeEvents(1).map((event) => ({
    ...event,
    title: '이벤트 1',
  }))[0];

  it('올바른 알림 메시지를 생성해야 한다', () => {
    const message = createNotificationMessage(event);

    expect(message).toBe('10분 후 이벤트 1 일정이 시작됩니다.');
  });
});
