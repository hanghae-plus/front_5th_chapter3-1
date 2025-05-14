import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const baseEvent: Omit<Event, 'id'> = {
    title: '회의',
    description: '',
    location: '',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '11:00',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  };

  const now = new Date('2025-07-01T09:51:00');

  it('알림 조건을 만족한 이벤트는 반환되어야 한다', () => {
    const events: Event[] = [{ ...baseEvent, id: '1' }];
    const result = getUpcomingEvents(events, now, []);
    expect(result.map((e) => e.id)).toContain('1');
  });

  it('이미 알림된 이벤트는 결과에 포함되지 않아야 한다', () => {
    const events: Event[] = [{ ...baseEvent, id: '2' }];
    const result = getUpcomingEvents(events, now, ['2']);
    expect(result).toEqual([]);
  });

  it('알림 시간 이전인 이벤트는 결과에 포함되지 않아야 한다', () => {
    const futureEvent: Event = {
      ...baseEvent,
      id: '3',
      startTime: '10:30', // notificationTime이 10분이므로 now와는 39분 차이
    };
    const result = getUpcomingEvents([futureEvent], now, []);
    expect(result).toEqual([]);
  });

  it('이미 시작된 이벤트는 결과에 포함되지 않아야 한다', () => {
    const pastEvent: Event = {
      ...baseEvent,
      id: '4',
      startTime: '09:00', // 이미 시작됨
    };
    const result = getUpcomingEvents([pastEvent], now, []);
    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('이벤트 제목과 알림 시간이 포함된 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: 'n1',
      title: '팀 회의',
      description: '',
      location: '',
      date: '2025-07-01',
      startTime: '15:00',
      endTime: '16:00',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    };

    const msg = createNotificationMessage(event);
    expect(msg).toBe('15분 후 팀 회의 일정이 시작됩니다.');
  });
});
