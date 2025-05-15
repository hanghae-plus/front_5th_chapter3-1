import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks';
import { Event } from '../../types.ts';
import { getTestEvents } from '../fixtures/eventFactory.ts';

describe('useNotifications', () => {
  const events = getTestEvents('notification');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-05-10T13:30:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications([] as Event[]));

    expect(result.current.notifications).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const event = events[0];

    const { result } = renderHook(() => useNotifications([event]));

    act(() => vi.advanceTimersByTime(1000));

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].message).toContain(event.title);
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const event = events[0];

    const { result } = renderHook(() => useNotifications([event]));

    act(() => result.current.removeNotification(0));

    expect(result.current.notifications).toEqual([]);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const event = events[0];

    const { result } = renderHook(() => useNotifications([event]));

    act(() => vi.advanceTimersByTime(1000));

    expect(result.current.notifications).toHaveLength(1);
    const initialCount = result.current.notifications.length;

    act(() => vi.advanceTimersByTime(1000));

    expect(result.current.notifications).toHaveLength(initialCount);
    expect(result.current.notifiedEvents).toContain(event.id);
  });
});
