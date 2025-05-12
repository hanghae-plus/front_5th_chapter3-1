import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const now = new Date('2025-05-01T09:00:00');

  const event: Event = {
    id: '1',
    title: '회의',
    date: '2025-05-01',
    startTime: '09:10',
    endTime: '10:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const events = [event];
    const result = getUpcomingEvents(events, now, []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events = [event];
    const result = getUpcomingEvents(events, now, ['1']);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const futureEvent = { ...event, startTime: '09:20' }; // 알림 시간은 20분 후
    const result = getUpcomingEvents([futureEvent], now, []);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const pastEvent = { ...event, startTime: '08:50' }; // 이미 시작함
    const result = getUpcomingEvents([pastEvent], now, []);
    expect(result).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '2',
      title: '팀 미팅',
      date: '2025-05-01',
      startTime: '11:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    };

    const message = createNotificationMessage(event);
    expect(message).toBe('5분 후 팀 미팅 일정이 시작됩니다.');
  });
});
