import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  // 테스트용 이벤트
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 30,
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2025-10-15',
      startTime: '12:30',
      endTime: '13:30',
      description: '클라이언트와 점심 미팅',
      location: '레스토랑',
      category: '약속',
      repeat: { type: 'none' },
      notificationTime: 60,
    },
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-10-15T09:30:00');
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(mockEvents, now, notifiedEvents);
    // id가 1인 이벤트 반환
    expect(upcomingEvents[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-10-15T09:30:00');
    // id가 1인 이벤트는 이미 알림이 간 상태
    const notifiedEvents: string[] = ['1'];
    const upcomingEvents = getUpcomingEvents(mockEvents, now, notifiedEvents);
    // 아무 이벤트도 반환되지 않아야 함
    expect(upcomingEvents.length).toBe(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-10-15T11:20:00');
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(mockEvents, now, notifiedEvents);
    expect(upcomingEvents.length).toBe(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-10-15T09:40:00');
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(mockEvents, now, notifiedEvents);
    expect(upcomingEvents.length).toBe(1);
  });
});

describe('createNotificationMessage', () => {
  const event: Event = {
    id: '1',
    title: '팀 회의',
    date: '2025-10-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none' },
    notificationTime: 30,
  };

  it('올바른 알림 메시지를 생성해야 한다', () => {
    const message = createNotificationMessage(event);

    expect(message).toBe('30분 후 팀 회의 일정이 시작됩니다.');
  });
});
