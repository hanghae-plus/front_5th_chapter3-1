import { act, renderHook } from '@testing-library/react';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import dummyNotificationEvents from '../dummy/dummyNotificationEvents.json' assert { type: 'json' };
import { parseHM } from '../utils.ts';

describe('useNotifications Hook', () => {
  const dummyEvents = dummyNotificationEvents.events as Event[];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(dummyEvents));
    expect(result.current.notifications).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    // 1. 초기 시간 설정 (알림 발생 시간 10분 전)
    vi.setSystemTime(new Date('2025-08-15T13:20:00'));

    // 2. 훅 렌더링
    const { result } = renderHook(() => useNotifications(dummyEvents));

    // 초기 상태 확인 (선택적이지만 좋은 습관)
    expect(result.current.notifications).toEqual([]);

    // 3. 시간 진행 (알림 발생 시간까지)
    const notificationMinutes = 10; // 가정: 10분 전 알림
    const timeToAdvance = notificationMinutes * 60 * 1000; // 10분을 ms로

    act(() => {
      vi.advanceTimersByTime(timeToAdvance);
    });

    // 4. 알림 확인
    expect(result.current.notifications).toHaveLength(1); // 알림이 1개 생성되었는지 확인

    expect(result.current.notifications[0]).toMatchObject({
      id: 'NOTIF001',
    });
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    vi.setSystemTime(new Date('2025-08-15T13:20:00'));

    const { result } = renderHook(() => useNotifications(dummyEvents));

    const notificationMinutes = 10;
    const timeToAdvance = notificationMinutes * 60 * 1000;

    act(() => {
      vi.advanceTimersByTime(timeToAdvance);
    });

    expect(result.current.notifications).toHaveLength(1);
    const notificationToRemoveIndex = 0;

    act(() => {
      result.current.removeNotification(notificationToRemoveIndex);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    // 1. 초기 시간 설정
    vi.setSystemTime(new Date('2025-08-15T13:20:00'));

    // 2. 훅 렌더링
    const { result } = renderHook(() => useNotifications(dummyEvents));

    const notificationMinutes = 10;
    const timeToAdvance = notificationMinutes * 60 * 1000;

    // 3. 시간 진행 (첫 번째 알림 발생)
    act(() => {
      vi.advanceTimersByTime(timeToAdvance);
    });

    // 4. 첫 번째 알림 확인
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toMatchObject({
      id: 'NOTIF001',
    });

    // 5. 시간 더 진행 (중복 알림 발생 방지 확인)
    act(() => {
      vi.advanceTimersByTime(timeToAdvance);
    });

    // 6. 알림이 여전히 1개인지 확인
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toMatchObject({
      id: 'NOTIF001',
    });

    // 7. notifiedEvents 상태 확인
    expect(result.current.notifiedEvents).toContain('NOTIF001');
  });
});
