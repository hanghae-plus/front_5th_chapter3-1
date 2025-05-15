import { Event, RepeatType } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  // 테스트에 사용할 이벤트 데이터
  const events: Event[] = [
    {
      id: '1',
      title: '알림 시간이 정확히 도래한 이벤트',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '10분 전 알림',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10, // 10분 전 알림
    },
    {
      id: '2',
      title: '이미 알림이 간 이벤트',
      date: '2025-07-01',
      startTime: '10:30',
      endTime: '11:30',
      description: '이미 알림 전송됨',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 15, // 15분 전 알림
    },
    {
      id: '3',
      title: '알림 시간이 아직 도래하지 않은 이벤트',
      date: '2025-07-01',
      startTime: '11:00',
      endTime: '12:00',
      description: '아직 알림 전 상태',
      location: '회의실 C',
      category: '미팅',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 30, // 30분 전 알림
    },
    {
      id: '4',
      title: '알림 시간이 지난 이벤트',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '이미 시작된 이벤트',
      location: '회의실 D',
      category: '교육',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 5, // 5분 전 알림
    },
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    // 현재 시간이 2025-07-01 09:50 (id:1 이벤트 시작 10분 전)
    const now = new Date('2025-07-01T09:50:00');
    const notifiedEvents: string[] = [];
    
    const result = getUpcomingEvents(events, now, notifiedEvents);
    
    // id:1 이벤트만 반환되어야 함
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    // 현재 시간이 2025-07-01 10:15 (id:2 이벤트 시작 15분 전)
    const now = new Date('2025-07-01T10:15:00');
    const notifiedEvents: string[] = ['2']; // 이미 알림이 간 이벤트 ID
    
    const result = getUpcomingEvents(events, now, notifiedEvents);
    
    // id:2는 이미 알림이 갔으므로 결과에 포함되지 않아야 함
    expect(result.length).toBe(0);
    expect(result.some(event => event.id === '2')).toBe(false);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    // 현재 시간이 2025-07-01 10:20 (id:3 이벤트 시작 40분 전, 알림은 30분 전)
    const now = new Date('2025-07-01T10:20:00');
    const notifiedEvents: string[] = [];
    
    const result = getUpcomingEvents(events, now, notifiedEvents);
    
    // id:3은 아직 알림 시간이 도래하지 않았으므로 결과에 포함되지 않아야 함
    expect(result.some(event => event.id === '3')).toBe(false);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    // 현재 시간이 2025-07-01 09:00 (id:4 이벤트 시작 시간)
    const now = new Date('2025-07-01T09:00:00');
    const notifiedEvents: string[] = [];
    
    const result = getUpcomingEvents(events, now, notifiedEvents);
    
    // id:4는 이미 시작되었으므로 결과에 포함되지 않아야 함
    expect(result.some(event => event.id === '4')).toBe(false);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '팀 미팅',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 15,
    };
    
    const message = createNotificationMessage(event);
    
    // 메시지 형식: "15분 후 팀 미팅 일정이 시작됩니다."
    expect(message).toBe('15분 후 팀 미팅 일정이 시작됩니다.');
  });
});
