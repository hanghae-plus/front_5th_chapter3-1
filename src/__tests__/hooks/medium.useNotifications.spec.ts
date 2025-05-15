import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

const now = new Date('2025-06-10T09:59:00');

beforeEach(() => {
  vi.useRealTimers();
  vi.useFakeTimers();
  vi.setSystemTime(now);
});

afterEach(() => {
  vi.useRealTimers();
});

const events: Event[] = [
  {
    id: '1',
    title: 'Event 1',
    date: '2025-06-10',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '2',
    title: 'Event 2',
    date: '2025-06-15',
    startTime: '12:30',
    endTime: '13:30',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
];

it('초기 상태에서는 알림이 비어 있어야 한다', () => {
  const { result } = renderHook(() => useNotifications(events));
  expect(result.current.notifications).toEqual([]);
});

it('알림 시간이 되면 새로운 알림이 생성되어야 한다', () => {
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toEqual([
    {
      id: '1',
      message: expect.stringContaining('Event 1'),
    },
  ]);
});

it('알림을 인덱스 기준으로 정상적으로 제거할 수 있어야 한다', () => {
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toEqual([]);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toEqual([
    {
      id: '1',
      message: expect.stringContaining('Event 1'),
    },
  ]);
});
