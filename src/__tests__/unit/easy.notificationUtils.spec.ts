import { Event } from '../../types';
import { getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const now = new Date('2025-07-01T09:00:00');

  const baseEvent: Omit<Event, 'id' | 'title'> = {
    date: '2025-07-01',
    startTime: '09:10',
    endTime: '10:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 15,
  };

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    // Given
    const events: Event[] = [
      { ...baseEvent, id: '1', title: '회의' }, // 10분 후 → 알림 시간(15분) 안에 포함됨
    ];

    // When
    const result = getUpcomingEvents(events, now, []);

    // Then
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    // Given
    const events: Event[] = [{ ...baseEvent, id: '2', title: '이미 알림됨' }];

    // When
    const result = getUpcomingEvents(events, now, ['2']);

    // Then
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    // Given
    const futureEvent: Event = {
      ...baseEvent,
      id: '3',
      title: '너무 이른 알림',
      startTime: '10:00', // 60분 뒤
      notificationTime: 15,
    };

    // When
    const result = getUpcomingEvents([futureEvent], now, []);

    // Then
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    // Given
    const pastEvent: Event = {
      ...baseEvent,
      id: '4',
      title: '이미 지난 이벤트',
      startTime: '08:30',
      notificationTime: 15,
    };

    // When
    const result = getUpcomingEvents([pastEvent], now, []);

    // Then
    expect(result).toHaveLength(0);
  });
});
