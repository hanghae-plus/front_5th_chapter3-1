import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { parseHM } from '../utils.ts';

describe('useNotifications', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '회의',
      description: '회의',
      location: '회의실',
      startTime: '10:00:00',
      endTime: '11:00:00',
      date: '2025-07-01',
      category: 'event',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2025-10-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심 식사',
      location: '수원역',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  it('초기 상태에서는 알림이 없어야 한다', () => {
    const mockEvents: Event[] = [];

    const { result } = renderHook(() => useNotifications(mockEvents));

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.notifiedEvents).toHaveLength(0);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const now = new Date('2025-07-01T09:50:00');
    vi.setSystemTime(now);

    const { result } = renderHook(() => useNotifications(mockEvents));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const notificationTime = parseHM(new Date('2025-07-01T10:00:00').getTime());

    expect(notificationTime).toBe('10:00');
    expect(result.current.notifications).toHaveLength(1);
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const { result } = renderHook(() => useNotifications([]));

    expect(result.current.notifications).toHaveLength(0);

    act(() => {
      result.current.setNotifications([{ id: '1', message: '10분 후 회의 일정이 시작됩니다.' }]);
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const now = new Date('2025-07-01T09:50:00');
    vi.setSystemTime(now);

    const { result } = renderHook(() => useNotifications(mockEvents));

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toHaveLength(1);
  });
});
