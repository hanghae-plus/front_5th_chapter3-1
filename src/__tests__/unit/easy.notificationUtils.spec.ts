import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { createTestEvent } from '../helpers/event';

describe('getUpcomingEvents', () => {
  const now = new Date('2025-07-01T09:00:00');

  const events = [
    createTestEvent({
      id: '1',
      title: '알람 시간 지남',
      date: '2025-07-01',
      startTime: '08:30:00', // -30분
      notificationTime: 15,
    }),
    createTestEvent({
      id: '2',
      title: '알림 시간',
      date: '2025-07-01',
      startTime: '09:15:00', // +15분
      notificationTime: 15,
    }),
    createTestEvent({
      id: '3',
      title: '알림 시간 이전',
      date: '2025-07-01',
      startTime: '09:30:00', // +30분
      notificationTime: 15,
    }),
    createTestEvent({
      id: '4',
      title: '알림 시간',
      date: '2025-07-01',
      startTime: '09:20:00', // +20분
      notificationTime: 20,
    }),
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const upcomingEvents = getUpcomingEvents(events, now, []);

    expect(upcomingEvents).toHaveLength(2);
    expect(upcomingEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: '2',
          title: '알림 시간',
          startTime: '09:15:00',
          notificationTime: 15,
        }),
        expect.objectContaining({
          id: '4',
          title: '알림 시간',
          startTime: '09:20:00',
          notificationTime: 20,
        }),
      ])
    );
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const notifiedEvents = ['2'];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    expect(upcomingEvents).toHaveLength(1);
    expect(upcomingEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: '4',
          title: '알림 시간',
          startTime: '09:20:00',
          notificationTime: 20,
        }),
      ])
    );
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const upcomingEvents = getUpcomingEvents(events, now, []);

    expect(upcomingEvents).toHaveLength(2);

    expect(upcomingEvents).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          id: '3',
          title: '알림 시간 이전',
          startTime: '09:30:00',
          notificationTime: 15,
        }),
      ])
    );
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const upcomingEvents = getUpcomingEvents(events, now, []);

    expect(upcomingEvents).toHaveLength(2);
    expect(upcomingEvents).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          id: '1',
          title: '알람 시간 지남',
          startTime: '08:30:00',
          notificationTime: 15,
        }),
      ])
    );
  });
});

describe('createNotificationMessage', () => {
  const events = [
    createTestEvent({
      title: '주간 회의',
      notificationTime: 15,
    }),
    createTestEvent({
      title: '점심 식사',
      notificationTime: 5,
    }),
  ];

  it('올바른 알림 메시지를 생성해야 한다', () => {
    const [weeklyMeeting, lunch] = events;

    const message = createNotificationMessage(weeklyMeeting);
    expect(message).toBe('15분 후 주간 회의 일정이 시작됩니다.');

    const message2 = createNotificationMessage(lunch);
    expect(message2).toBe('5분 후 점심 식사 일정이 시작됩니다.');
  });
});
