import { Event } from '../../entities/event/model/types';
import {
  createNotificationMessage,
  getUpcomingEvents,
} from '../../features/event-operations/lib/notificationUtils';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-07-01T14:30:00');
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30',
        notificationTime: 0,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '15:00',
        endTime: '16:00',
        notificationTime: 30,
      },
    ];

    const notifiedEvents = ['1'];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    expect(upcomingEvents).toEqual([
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '15:00',
        endTime: '16:00',
        notificationTime: 30,
      },
    ]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-07-01T14:30:00');
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30',
        notificationTime: 0,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '15:00',
        endTime: '16:00',
        notificationTime: 30,
      },
    ];

    const notifiedEvents = ['1'];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    expect(upcomingEvents).toEqual([
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '15:00',
        endTime: '16:00',
        notificationTime: 30,
      },
    ]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-07-01T14:29:00');
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30',
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '15:00',
        endTime: '16:00',
        notificationTime: 30,
      },
    ];

    const notifiedEvents = [];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    expect(upcomingEvents).toEqual([
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30',
        notificationTime: 10,
      },
    ]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-07-01T14:31:00');
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30',
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '15:00',
        endTime: '16:00',
        notificationTime: 0,
      },
    ];

    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    expect(upcomingEvents).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      notificationTime: 10,
      description: '',
      location: '',
      category: '',
      repeat: undefined,
    };

    const message = createNotificationMessage(event);
    expect(message).toBe('10분 후 이벤트 1 일정이 시작됩니다.');
  });
});
