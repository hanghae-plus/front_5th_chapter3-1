import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
// import { Event } from '../../types.ts';
// import { formatDate } from '../../utils/dateUtils.ts';
// import { parseHM } from '../utils.ts';
import { SAMPLE_EVENTS } from '../SampleEvent.ts';

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(SAMPLE_EVENTS));
  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  vi.useFakeTimers();
  vi.setSystemTime('2025-10-15T08:49:00');
  const { result } = renderHook(() => useNotifications(SAMPLE_EVENTS));
  expect(result.current.notifications).toEqual([]);
  act(() => {
    vi.advanceTimersByTime(60 * 1000);
  });
  expect(result.current.notifications).toEqual([
    {
      id: '1',
      message: '10분 후 이벤트 1 일정이 시작됩니다.',
    },
  ]);
  vi.useRealTimers();
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  vi.useFakeTimers();
  vi.setSystemTime('2025-10-15T08:49:00');
  const { result } = renderHook(() => useNotifications(SAMPLE_EVENTS));
  expect(result.current.notifications).toEqual([]);
  act(() => {
    vi.advanceTimersByTime(60 * 1000);
    result.current.removeNotification(0);
  });
  expect(result.current.notifications).toEqual([]);
  vi.useRealTimers();
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  vi.useFakeTimers();
  vi.setSystemTime('2025-10-15T08:49:00');
  const { result } = renderHook(() => useNotifications(SAMPLE_EVENTS));
  expect(result.current.notifications).toEqual([]);
  act(() => {
    vi.advanceTimersByTime(60 * 1000);
  });
  expect(result.current.notifications).toEqual([
    {
      id: '1',
      message: '10분 후 이벤트 1 일정이 시작됩니다.',
    },
  ]);
  act(() => {
    vi.advanceTimersByTime(60 * 1000);
  });
  expect(result.current.notifications).toEqual([
    {
      id: '1',
      message: '10분 후 이벤트 1 일정이 시작됩니다.',
    },
  ]);
  vi.useRealTimers();
});
