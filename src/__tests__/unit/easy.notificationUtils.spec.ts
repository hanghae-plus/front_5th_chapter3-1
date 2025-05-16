import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-06-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const events = getUpcomingEvents(mockEvents, new Date('2025-06-15 08:50'), []);
    expect(events).toHaveLength(1);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events = getUpcomingEvents(mockEvents, new Date('2025-06-15 08:55'), ['1']);
    expect(events).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events = getUpcomingEvents(mockEvents, new Date('2025-06-15 08:30'), []);
    expect(events).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events = getUpcomingEvents(mockEvents, new Date('2025-06-15 09:05'), []);
    expect(events).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  const mockEvent: Event = {
    id: '1',
    title: '기존 회의',
    date: '2025-06-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  it('올바른 알림 메시지를 생성해야 한다', () => {
    const message = createNotificationMessage(mockEvent);
    expect(message).toBe('10분 후 기존 회의 일정이 시작됩니다.');
  });
});
