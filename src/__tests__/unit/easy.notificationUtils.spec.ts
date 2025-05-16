import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10, // 10분 전 알림
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2025-07-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '점심 약속',
      location: '식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30, // 30분 전 알림
    },
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-07-01T13:50:00'); // 14:00 회의 10분 전
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-07-01T13:50:00');
    const notifiedEvents = ['1']; // 이미 알림이 간 이벤트

    const result = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-07-01T13:40:00'); // 14:00 회의 20분 전
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-07-01T14:01:00'); // 회의 시작 1분 후
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(result).toHaveLength(0);
  });

  it('여러 이벤트의 알림 시간이 동시에 도래한 경우 모두 반환한다', () => {
    const now = new Date('2025-07-01T11:30:00'); // 12:00 점심 약속 30분 전
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '회의',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const message = createNotificationMessage(event);
    expect(message).toBe('10분 후 회의 일정이 시작됩니다.');
  });

  it('다른 알림 시간의 메시지도 올바르게 생성한다', () => {
    const event: Event = {
      id: '2',
      title: '점심 약속',
      date: '2025-07-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '점심 약속',
      location: '식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const message = createNotificationMessage(event);
    expect(message).toBe('30분 후 점심 약속 일정이 시작됩니다.');
  });
});
