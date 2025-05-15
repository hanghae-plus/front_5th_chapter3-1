import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명 1',
        location: '장소 1',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '12:00',
        endTime: '13:00',
        description: '설명 2',
        location: '장소 2',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const currentDate = new Date('2025-07-02T11:59');

    const upcomingEvents = getUpcomingEvents(events, currentDate, []);

    expect(upcomingEvents).toEqual([events[1]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명 1',
        location: '장소 1',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '12:00',
        endTime: '13:00',
        description: '설명 2',
        location: '장소 2',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const currentDate = new Date('2025-07-02T11:59');

    const upcomingEvents = getUpcomingEvents(events, currentDate, ['1']);

    expect(upcomingEvents).toEqual([events[1]]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명 1',
        location: '장소 1',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 2,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '12:00',
        endTime: '13:00',
        description: '설명 2',
        location: '장소 2',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const currentDate = new Date('2025-07-02T11:59');

    const upcomingEvents = getUpcomingEvents(events, currentDate, []);

    expect(upcomingEvents).toEqual([events[1]]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명 1',
        location: '장소 1',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '12:00',
        endTime: '13:00',
        description: '설명 2',
        location: '장소 2',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const currentDate = new Date('2025-07-02T13:01');

    const upcomingEvents = getUpcomingEvents(events, currentDate, []);

    expect(upcomingEvents).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명 1',
      location: '장소 1',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const message = createNotificationMessage(event);

    expect(message).toBe('30분 후 이벤트 1 일정이 시작됩니다.');
  });
});