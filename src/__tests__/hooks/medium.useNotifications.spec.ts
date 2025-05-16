import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

const EVENTS: Event[] = [
  {
    id: '1',
    title: '테스트 이벤트 1',
    date: '2025-05-13',
    startTime: '12:00',
    endTime: '13:00',
    description: '설명 1',
    location: '장소 1',
    category: '카테고리 1',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '테스트 이벤트 2',
    date: '2025-05-18',
    startTime: '14:00',
    endTime: '15:00',
    description: '설명 2',
    location: '장소 2',
    category: '카테고리 2',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 5,
  },
];

describe('useNotification Hook Test', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-05-13 11:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(EVENTS));
    expect(result.current.notifications).toHaveLength(0);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const { result } = renderHook(() => useNotifications(EVENTS));

    expect(result.current.notifications.length).toBe(0);

    act(() => {
      vi.advanceTimersByTime(60 * 1000 * 50);
    });

    expect(result.current.notifications.length).toBe(1);
    expect(result.current.notifications[0].message).toBe(
      '10분 후 테스트 이벤트 1 일정이 시작됩니다.'
    );
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const { result } = renderHook(() => useNotifications(EVENTS));

    act(() => {
      vi.advanceTimersByTime(50 * 60 * 1000);
    });

    expect(result.current.notifications.length).toBe(1);

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications.length).toBe(0);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const { result } = renderHook(() => useNotifications(EVENTS));

    act(() => {
      vi.advanceTimersByTime(50 * 60 * 1000);
    });

    expect(result.current.notifications.length).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1 * 60 * 1000);
    });

    expect(result.current.notifications.length).toBe(1);
  });
});
