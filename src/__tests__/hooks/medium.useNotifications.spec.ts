import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

const events: Event[] = [
  {
    id: '1',
    title: '회의',
    description: '회의',
    location: '회의실',
    startTime: '10:00:00',
    endTime: '11:00:00',
    date: '2025-07-01',
    category: 'event',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-10-01',
    startTime: '12:00',
    endTime: '13:00',
    description: '친구와 점심 식사',
    location: '수원역',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
];

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(events));
  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
  vi.setSystemTime('2025-07-01T09:50:00');

  const { result } = renderHook(() => useNotifications(events));
  expect(result.current.notifications).toEqual([]);

  await act(async () => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications.length).toBe(1);
  expect(result.current.notifications[0].id).toBe('1');
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
  vi.setSystemTime('2025-07-01T09:50:00');

  const { result } = renderHook(() => useNotifications(events));
  expect(result.current.notifications).toEqual([]);

  await act(async () => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications.length).toBe(1);
  expect(result.current.notifications[0].id).toBe('1');

  await act(async () => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toEqual([]);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
  vi.setSystemTime('2025-07-01T09:50:00');

  const { result } = renderHook(() => useNotifications(events));
  expect(result.current.notifications).toEqual([]);

  await act(async () => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications.length).toBe(1);
  expect(result.current.notifications[0].id).toBe('1');

  await act(async () => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications.length).toBe(1);
  expect(result.current.notifications[0].id).toBe('1');
});
