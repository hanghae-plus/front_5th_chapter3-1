import { act, renderHook } from '@testing-library/react';

import { events } from '../../__mocks__/response/realEvents.json';
import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

const mockEvents = events as Event[];

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-05-20 09:59'));
});

afterEach(() => {
  vi.clearAllTimers();
});

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(mockEvents));

  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const { result } = renderHook(() => useNotifications(mockEvents));

  expect(result.current.notifications.length).toBe(0);

  act(() => {
    // 1초만 시간이 흐르도록 하여 알림 생성
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications.length).toBe(1);
  expect(result.current.notifications[0].message).toBe('1분 후 팀 회의 일정이 시작됩니다.');
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications.length).toBe(1);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications.length).toBe(0);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications.length).toBe(1);

  act(() => {
    vi.advanceTimersByTime(2000);
  });

  expect(result.current.notifications.length).toBe(1);
});
