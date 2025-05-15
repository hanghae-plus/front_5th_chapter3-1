import { act, renderHook } from '@testing-library/react';

import { events } from '../../__mocks__/response/events.json';
import { useNotifications } from '../../hooks/useNotifications';
import { Event } from '../../types';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-15T08:49:00'));
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));
  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
  const mockEvents = events as Event[];
  const { result } = renderHook(() => useNotifications(mockEvents));

  expect(result.current.notifications.length).toBe(0);

  act(() => {
    vi.advanceTimersByTime(60 * 1000); //1분뒤 8:50
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].message).toContain('회의');
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const mockEvents = events as Event[];
  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => {
    vi.advanceTimersByTime(60 * 1000);
  });

  expect(result.current.notifications).toHaveLength(1);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(0);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const mockEvents = events as Event[];
  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => {
    vi.advanceTimersByTime(60 * 1000);
  });

  expect(result.current.notifications.length).toBe(1);

  act(() => {
    vi.advanceTimersByTime(60 * 1000);
  });

  expect(result.current.notifications.length).toBe(1);
});
