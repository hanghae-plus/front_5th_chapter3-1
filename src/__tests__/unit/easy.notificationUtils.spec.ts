import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
// createNotificationMessage 함수는 이벤트 정보를 받아 알림 메시지를 생성
// getUpcomingEvents 는 현재 시간과 알림을 보낸 이벤트 목록을 받아 알림 시간이 도래한 이벤트를 반환

describe('getUpcomingEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '미팅',
      date: '2024-03-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2024-03-20',
      startTime: '12:00',
      endTime: '13:00',
      description: '팀 점심',
      location: '식당',
      category: '식사',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    },
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2024-03-20T09:45:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2024-03-20T09:45:00');
    const notifiedEvents = ['1'];

    const result = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2024-03-20T09:00:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2024-03-20T10:30:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(result).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '미팅',
      date: '2024-03-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    };

    const result = createNotificationMessage(event);

    expect(result).toBe('30분 후 미팅 일정이 시작됩니다.');
  });
});
