import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { useNotifications } from '../../hooks/useNotifications.ts';
import { parseHM } from '../utils.ts';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-05-14T22:00:00'));
});

// 테스트 후 실제 타이머로 복원
afterEach(() => {
  vi.useRealTimers();
});

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(events));
  expect(result.current.notifications.length).toBe(0);
  expect(result.current.notifiedEvents).toHaveLength(0);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  // 알림 시작 5분 전 시간으로 변경
  vi.setSystemTime(new Date('2025-10-15T08:45:00.000Z'));
  const { result } = renderHook(() => useNotifications(events));

  // 현재 시간에는 알림이 없음
  expect(result.current.notifications.length).toBe(0);
  expect(result.current.notifiedEvents).toHaveLength(0);

  // 시간을 5분 진행시켜 알림 시간(08:50)에 도달
  act(() => {
    vi.advanceTimersByTime(5 * 60 * 1000);
  });

  const notificationTime = parseHM(Date.now());

  expect(notificationTime).toBe('08:50');
  expect(result.current.notifications.length).toBe(1);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  vi.setSystemTime(new Date('2025-10-15T08:45:00.000Z'));
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(5 * 60 * 1000);
  });

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications.length).toBe(0);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  vi.setSystemTime(new Date('2025-10-15T08:45:00.000Z'));
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(5 * 60 * 1000);
  });

  act(() => {
    vi.advanceTimersByTime(5 * 60 * 1000);
  });

  expect(result.current.notifications.length).toBe(1);
});
