import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

vi.useFakeTimers();
vi.setSystemTime(new Date('2025-10-01T09:00:00')); // 기준 시간 고정

it('초기 상태에서는 알림이 없어야 한다', () => {
  const baseEvent: Event = {
    id: '1',
    title: '회의',
    date: formatDate(new Date()), // 오늘
    startTime: parseHM(Date.now() + 5 * 60 * 1000), // 5분 뒤
    endTime: parseHM(Date.now() + 6 * 60 * 1000),
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10, // 10분 전 알림
  };

  const { result } = renderHook(() => useNotifications([baseEvent]));

  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const baseEvent: Event = {
    id: '1',
    title: '회의',
    date: formatDate(new Date()), // 오늘
    startTime: parseHM(Date.now() + 5 * 60 * 1000), // 5분 뒤
    endTime: parseHM(Date.now() + 6 * 60 * 1000),
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10, // 10분 전 알림
  };

  const { result } = renderHook(() => useNotifications([baseEvent]));

  act(() => {
    vi.advanceTimersByTime(1000); // 1초 경과
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0]).toEqual({
    id: '1',
    message: '10분 후 회의 일정이 시작됩니다.',
  });

  expect(result.current.notifiedEvents).toEqual(['1']);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const baseEvent: Event = {
    id: '1',
    title: '회의',
    date: formatDate(new Date()), // 오늘
    startTime: parseHM(Date.now() + 5 * 60 * 1000), // 5분 뒤
    endTime: parseHM(Date.now() + 6 * 60 * 1000),
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10, // 10분 전 알림
  };

  const { result } = renderHook(() => useNotifications([baseEvent]));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(0);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const baseEvent: Event = {
    id: '1',
    title: '회의',
    date: formatDate(new Date()), // 오늘
    startTime: parseHM(Date.now() + 5 * 60 * 1000), // 5분 뒤
    endTime: parseHM(Date.now() + 6 * 60 * 1000),
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10, // 10분 전 알림
  };

  const { result } = renderHook(() => useNotifications([baseEvent]));

  act(() => {
    vi.advanceTimersByTime(1000); // 첫 알림 발생
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toContain('1');

  act(() => {
    vi.advanceTimersByTime(1000); // 다시 1초 경과
  });

  // 여전히 1개여야 함
  expect(result.current.notifications).toHaveLength(1);
});
