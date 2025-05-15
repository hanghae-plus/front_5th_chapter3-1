import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';
import { events } from '../../__mocks__/response/mockEvents.json' assert { type: 'json' };
const MOCK_EVENTS = events as Event[];
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));

  expect(result.current.notifications).toHaveLength(0);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
  vi.useFakeTimers();
  const now = new Date();
  const startTime = parseHM(now.getTime() + 2 * 60 * 1000);

  const event: Event = {
    id: '1',
    title: '테스트 회의',
    date: formatDate(now),
    startTime: startTime,
    endTime: '23:58',
    description: '테스트회의',
    location: '회의실',
    category: '업무 회의',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 2,
  };

  const { result } = renderHook(() => useNotifications([event]));

  await act(() => vi.advanceTimersByTime(1000));

  expect(result.current.notifications).toHaveLength(1);
  vi.useRealTimers();
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications(MOCK_EVENTS));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(0);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications.length).toBe(0);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
  vi.useFakeTimers();

  const now = new Date();
  const startTime = parseHM(now.getTime() + 2 * 60 * 1000);

  const event: Event = {
    id: '1',
    title: '테스트 회의',
    date: formatDate(now),
    startTime: startTime,
    endTime: '23:58',
    description: '테스트회의',
    location: '회의실',
    category: '업무 회의',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 2,
  };

  const { result } = renderHook(() => useNotifications([event]));

  await act(async () => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);

  await act(async () => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);

  vi.useRealTimers();
});
