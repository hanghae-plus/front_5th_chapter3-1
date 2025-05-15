import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

describe('useNotifications', () => {
  let mockEvent: Event;

  beforeEach(() => {
    vi.useFakeTimers();

    mockEvent = {
      id: '1',
      title: '이벤트 1',
      description: '이벤트 1 설명',
      location: '이벤트 1 위치',
      category: '이벤트 1 카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
      date: formatDate(new Date('2025-05-12')),
      startTime: '14:30',
      endTime: '15:30',
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications([]));

    expect(result.current.notifications).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const currentDate = new Date('2025-05-12T14:20:00');
    vi.setSystemTime(currentDate);

    const { result } = renderHook(() => useNotifications([mockEvent]));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const notificationTime = parseHM(Date.now());

    expect(notificationTime).toBe('14:20');
    expect(result.current.notifications).toHaveLength(1);
  });
  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const currentDate = new Date('2025-05-12T14:20:00');
    vi.setSystemTime(currentDate);

    const { result } = renderHook(() => useNotifications([mockEvent]));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const currentDate = new Date('2025-05-12T14:20:00');
    vi.setSystemTime(currentDate);

    const { result } = renderHook(() => useNotifications([mockEvent]));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);
  });
});
