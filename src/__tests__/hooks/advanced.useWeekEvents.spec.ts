import { renderHook } from '@testing-library/react';

import { useWeekEvents } from '../../hooks/useWeekEvents';
import { Event } from '../../types';

describe('useWeekEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '첫 번째 이벤트',
      date: '2024-11-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '첫 번째 이벤트 설명',
      location: '회의실 A',
      category: '업무',
      notificationTime: 10,
      repeat: {
        type: 'none',
        interval: 0,
      },
    },
    {
      id: '2',
      title: '두 번째 이벤트',
      date: '2024-11-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '두 번째 이벤트 설명',
      location: '회의실 B',
      category: '업무',
      notificationTime: 10,
      repeat: {
        type: 'none',
        interval: 0,
      },
    },
    {
      id: '3',
      title: '다른 날의 이벤트',
      date: '2024-11-02',
      startTime: '10:00',
      endTime: '11:00',
      description: '다른 날의 이벤트 설명',
      location: '회의실 C',
      category: '업무',
      notificationTime: 10,
      repeat: {
        type: 'none',
        interval: 0,
      },
    },
    {
      id: '4',
      title: '반복 이벤트',
      date: '2024-11-01',
      startTime: '16:00',
      endTime: '17:00',
      description: '반복 이벤트 설명',
      location: '회의실 D',
      category: '업무',
      notificationTime: 10,
      repeat: {
        type: 'daily',
        interval: 1,
      },
    },
  ];

  it('특정 날짜의 이벤트만 필터링해야 한다', () => {
    const notifiedEvents: string[] = [];
    const { result } = renderHook(() => useWeekEvents(mockEvents, notifiedEvents));

    const eventsForNov1 = result.current.getEventsForDate(new Date('2024-11-01'));
    const eventsForNov2 = result.current.getEventsForDate(new Date('2024-11-02'));

    expect(eventsForNov1).toHaveLength(3);
    expect(eventsForNov2).toHaveLength(1);
    expect(eventsForNov1.map((e) => e.title)).toEqual([
      '첫 번째 이벤트',
      '두 번째 이벤트',
      '반복 이벤트',
    ]);
    expect(eventsForNov2.map((e) => e.title)).toContain('다른 날의 이벤트');
  });

  it('알림이 있는 이벤트를 올바르게 표시해야 한다', () => {
    const notifiedEvents: string[] = ['1', '3'];
    const { result } = renderHook(() => useWeekEvents(mockEvents, notifiedEvents));

    const eventsForNov1 = result.current.getEventsForDate(new Date('2024-11-01'));
    const eventsForNov2 = result.current.getEventsForDate(new Date('2024-11-02'));

    expect(eventsForNov1[0].isNotified).toBe(true);
    expect(eventsForNov1[1].isNotified).toBe(false);
    expect(eventsForNov2[0].isNotified).toBe(true);
  });

  it('존재하지 않는 날짜의 이벤트는 빈 배열을 반환해야 한다', () => {
    const notifiedEvents: string[] = [];
    const { result } = renderHook(() => useWeekEvents(mockEvents, notifiedEvents));

    const eventsForNov10 = result.current.getEventsForDate(new Date('2024-11-10'));

    expect(eventsForNov10).toHaveLength(0);
  });

  it('날짜가 같은 이벤트들을 올바르게 비교해야 한다', () => {
    const notifiedEvents: string[] = [];
    const { result } = renderHook(() => useWeekEvents(mockEvents, notifiedEvents));

    const eventsForNov1 = result.current.getEventsForDate(new Date('2024-11-01T23:59:59'));

    expect(eventsForNov1).toHaveLength(3);
    expect(eventsForNov1.map((e) => e.title)).toEqual([
      '첫 번째 이벤트',
      '두 번째 이벤트',
      '반복 이벤트',
    ]);
  });

  it('이벤트가 시간 순서대로 정렬된다', () => {
    const notifiedEvents: string[] = [];
    const { result } = renderHook(() => useWeekEvents(mockEvents, notifiedEvents));

    const eventsForNov1 = result.current.getEventsForDate(new Date('2024-11-01'));

    expect(eventsForNov1.map((e) => e.startTime)).toEqual(['10:00', '14:00', '16:00']);
  });
});
