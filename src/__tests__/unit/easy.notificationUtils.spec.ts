import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const currentTime = new Date('2025-05-15T12:00');
  const events: Event[] = [
    {
      id: '1',
      title: '곧 시작할 일정입니다',
      date: '2025-05-15',
      startTime: '12:30',
      endTime: '13:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    },
    {
      id: '2',
      title: '이미 알람이 감',
      date: '2025-05-14',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
    {
      id: '3',
      title: '알람 시작 예정',
      date: '2025-05-23',
      startTime: '15:00',
      endTime: '16:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '4',
      title: '지난 일정',
      date: '2025-05-10',
      startTime: '11:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    }
  ]

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const result = getUpcomingEvents(events, currentTime, []);
    
    expect(result.map((e)=>e.id)).toContain('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const result = getUpcomingEvents(events, currentTime, []);
    
    expect(result.map((e)=>e.id)).not.toContain('2');
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const result = getUpcomingEvents(events, currentTime, []);
    
    expect(result.map((e)=>e.id)).not.toContain('4');
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const result = getUpcomingEvents(events, currentTime, []);
    
    expect(result.map((e)=>e.id)).not.toContain('5');
  });
});

describe('createNotificationMessage', () => {
  const event: Event = {
    id: '3',
    title: '알람 시작 예정',
    date: '2025-05-12',
    startTime: '12:30',
    endTime: '16:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  }

  it('올바른 알림 메시지를 생성해야 한다', () => { 
    const alert = createNotificationMessage(event)

    expect(alert).toBe('10분 후 팀 미팅 일정이 시작됩니다.');

  });
});
