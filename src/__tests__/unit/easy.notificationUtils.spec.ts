import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const now = new Date('2025-05-21T12:00');
  const events: Event[] = [
    {
      id: '1',
      title: '곧 시작할 일정입니다',
      date: '2025-05-21',
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
      title: '이미 알림이 간 일정입니다',
      date: '2025-05-18',
      startTime: '10:30',
      endTime: '11:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    },
    {
      id: '3',
      title: '아직 시작하지 않은 일정입니다',
      date: '2025-05-24',
      startTime: '12:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    },
    {
      id: '4',
      title: '이미 지난 일정입니다',
      date: '2025-05-20',
      startTime: '11:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    },
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const result = getUpcomingEvents(events, now, []);

    expect(result.map((e) => e.id)).toContain('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const result = getUpcomingEvents(events, now, ['2']);

    expect(result.map((e) => e.id)).not.toContain('2');
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const result = getUpcomingEvents(events, now, []);

    expect(result.map((e) => e.id)).not.toContain('3');
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const result = getUpcomingEvents(events, now, []);

    expect(result.map((e) => e.id)).not.toContain('4');
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '팀 미팅',
      date: '2025-05-21',
      startTime: '12:30',
      endTime: '13:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    };

    const message = createNotificationMessage(event);

    expect(message).toBe('15분 후 팀 미팅 일정이 시작됩니다.');
  });
});
