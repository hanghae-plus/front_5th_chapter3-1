import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { useNotifications } from '../../hooks/useNotifications';
import { Event } from '../../types';

vi.useFakeTimers();

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Meeting',
    date: '2025-05-13',
    startTime: '10:00',
    endTime: '11:00',
    description: 'Team meeting',
    location: 'Office',
    category: 'Work',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5, // 5분 전 알림
  },
  {
    id: '2',
    title: 'Lunch',
    date: '2025-05-13',
    startTime: '12:00',
    endTime: '13:00',
    description: 'Lunch with client',
    location: 'Restaurant',
    category: 'Work',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10, // 10분 전 알림
  },
];

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));
  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => {
    vi.setSystemTime(new Date('2025-05-13T09:55:00')); // 첫 번째 이벤트 알림 시간
    vi.advanceTimersByTime(1000); // 1초 경과
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].message).toContain('Meeting');

  act(() => {
    vi.setSystemTime(new Date('2025-05-13T11:50:00')); // 두 번째 이벤트 알림 시간
    vi.advanceTimersByTime(1000); // 1초 경과
  });

  expect(result.current.notifications).toHaveLength(2);
  expect(result.current.notifications[1].message).toContain('Lunch');
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => {
    vi.setSystemTime(new Date('2025-05-13T09:55:00'));
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(0);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => {
    vi.setSystemTime(new Date('2025-05-13T09:55:00'));
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);

  act(() => {
    vi.advanceTimersByTime(1000); // 다시 1초 경과
  });

  expect(result.current.notifications).toHaveLength(1); // 중복 알림 없음
});
