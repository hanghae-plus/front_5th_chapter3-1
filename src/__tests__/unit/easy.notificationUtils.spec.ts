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
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '09:59',
        endTime: '11:00',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
        category: '이벤트 2 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2025-07-01',
        startTime: '10:01',
        endTime: '11:00',
        description: '이벤트 3 설명',
        location: '이벤트 3 장소',
        category: '이벤트 3 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '4',
        title: '이벤트 4',
        date: '2025-07-01',
        startTime: '10:10',
        endTime: '11:00',
        description: '이벤트 4 설명',
        location: '이벤트 4 장소',
        category: '이벤트 4 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 10,
      },
    ];
    const now = new Date('2025-07-01T10:00');

    const result = getUpcomingEvents(events, now, []);

    expect(result).toEqual([events[3]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '09:59',
        endTime: '11:00',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
        category: '이벤트 2 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2025-07-01',
        startTime: '10:01',
        endTime: '11:00',
        description: '이벤트 3 설명',
        location: '이벤트 3 장소',
        category: '이벤트 3 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '4',
        title: '이벤트 4',
        date: '2025-07-01',
        startTime: '10:10',
        endTime: '11:00',
        description: '이벤트 4 설명',
        location: '이벤트 4 장소',
        category: '이벤트 4 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 10,
      },
    ];
    const now = new Date('2025-07-01T10:00');
    const notifiedEvents = [events[3].id];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:20',
        endTime: '11:00',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 4 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 10,
      },
    ];
    const now = new Date('2025-07-01T10:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 10,
      },
    ];
    const now = new Date('2025-07-01T10:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([]);
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
      description: '이벤트 1 설명',
      location: '이벤트 1 장소',
      category: '이벤트 1 카테고리',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 10,
    };

    const message = createNotificationMessage(event);

    expect(message).toBe('10분 후 이벤트 1 일정이 시작됩니다.');
  });
});
