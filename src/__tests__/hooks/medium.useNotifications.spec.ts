import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

function createEvent(overrides?: Partial<Event>): Event {
  return {
    id: '1',
    title: '회의',
    description: '',
    location: '',
    category: '',
    date: formatDate(new Date()), // 오늘 날짜
    startTime: '10:00',
    endTime: '11:00',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
    ...overrides,
  };
}

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers(); // 가짜 타이머 활성화
  });

  afterEach(() => {
    vi.useRealTimers(); // 테스트 후 타이머 복원
  });
});

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));
  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const now = new Date();
  const in30min = new Date(now.getTime() + 30 * 60 * 1000);

  const event = createEvent({
    id: 'a1',
    startTime: parseHM(Number(in30min)),
  });

  const { result } = renderHook(() => useNotifications([event]));

  // 현재 시간을 고정
  act(() => {
    vi.setSystemTime(now);
    vi.advanceTimersByTime(1000); // 1초 경과
  });

  expect(result.current.notifications.length).toBe(1);
  expect(result.current.notifications[0].message).toBe('30분 후 회의 일정이 시작됩니다.');
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const now = new Date();
  const in30min = new Date(now.getTime() + 30 * 60 * 1000);

  const event = createEvent({
    id: 'a2',
    startTime: parseHM(Number(in30min)),
  });

  const { result } = renderHook(() => useNotifications([event]));

  act(() => {
    vi.setSystemTime(now);
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications.length).toBe(1);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications.length).toBe(0);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const now = new Date();
  const in30min = new Date(now.getTime() + 30 * 60 * 1000);

  const event = createEvent({
    id: 'a3',
    startTime: parseHM(Number(in30min)),
  });

  const { result } = renderHook(() => useNotifications([event]));

  act(() => {
    vi.setSystemTime(now);
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications.length).toBe(1);

  // 이후 타이머가 더 진행돼도 알림이 중복 추가되면 안 됨
  act(() => {
    vi.advanceTimersByTime(5000);
  });

  expect(result.current.notifications.length).toBe(1);
});
