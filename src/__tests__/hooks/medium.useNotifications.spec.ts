import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

beforeEach(() => {
    vi.useRealTimers();
    vi.useFakeTimers();
});

afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
});

it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications([]));

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.notifiedEvents).toHaveLength(0);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const now = new Date('2025-11-11T12:00:00');
    vi.setSystemTime(now);
    const events: Event[] = [
      {
        id: '1',
        title: '새로 생성될 알림',
        date: '2025-11-11',
        startTime: '12:01',
        endTime: '13:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const { result } = renderHook(() => useNotifications(events));

    act(() => vi.advanceTimersByTime(1000));

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].message).toBe('1분 후 새로 생성될 알림 일정이 시작됩니다.');
    expect(result.current.notifiedEvents).toEqual(['1']);    
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const now = new Date('2025-05-23T06:30:30');
    vi.setSystemTime(now);

    const events: Event[] = [
        {
          id: '1',
          title: '중복 알림 발생',
          date: '2025-05-21',
          startTime: '12:01',
          endTime: '13:00',
          description: '',
          location: '',
          category: '',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 1,
        },
    ];

    const { result } = renderHook(() => useNotifications(events));

    act(() => vi.advanceTimersByTime(1000));

    expect(result.current.notifications).toHaveLength(0);
});
