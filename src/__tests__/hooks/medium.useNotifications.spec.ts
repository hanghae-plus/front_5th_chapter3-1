import { act, renderHook } from '@testing-library/react';

import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../../entities/event/model/types.ts';
import { useNotifications } from '../../features/event-operations/model/useNotifications.ts';

const INITIAL_EVENTS = events as Event[];

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(INITIAL_EVENTS));

  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  vi.useFakeTimers();

  vi.setSystemTime(new Date('2025-10-15T08:49:00'));

  const { result } = renderHook(() => useNotifications(INITIAL_EVENTS));

  expect(result.current.notifications).toEqual([]);

  // 1분 후
  act(() => {
    vi.advanceTimersByTime(1000 * 60);
  });

  // 1분 후 첫 알림이 생성되어야 한다.
  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toEqual(['1']);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  // 미리 알림 추가
  const { result } = renderHook(() => useNotifications([]));

  act(() => {
    result.current.setNotifications([
      ...result.current.notifications,
      { id: '1', message: 'Test Notification 1' },
      { id: '2', message: 'Test Notification 2' },
    ]);
  });

  act(() => {
    result.current.removeNotification(0);
  });
  expect(result.current.notifications).toEqual([{ id: '2', message: 'Test Notification 2' }]);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  vi.useFakeTimers();

  vi.setSystemTime(new Date('2025-10-15T08:49:00'));

  const { result } = renderHook(() => useNotifications(INITIAL_EVENTS));

  // 1분 후
  act(() => {
    vi.advanceTimersByTime(1000 * 60);
  });

  // 1분 후 첫 알림이 생성되어야 한다.
  expect(result.current.notifications).toHaveLength(1);

  // 10분 후
  act(() => {
    vi.advanceTimersByTime(1000 * 60 * 10);
  });

  // 여전히 1개의 알림이 있어야 한다.
  expect(result.current.notifications).toHaveLength(1);
});
