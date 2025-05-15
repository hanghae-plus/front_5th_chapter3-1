import { act, renderHook } from '@testing-library/react';

import eventsData from '../../__mocks__/response/events.json';
import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(eventsData.events as Event[]));

  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const now = new Date();
  const minutesLater = new Date(now.getTime() + 10 * 60 * 1000);

  const upcoming = {
    id: '12341234',
    title: 'upcoming event',
    date: formatDate(minutesLater),
    startTime: parseHM(minutesLater.getTime()),
    endTime: '23:59',
    description: 'TF 미팅',
    location: '회의실 C',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  const { result } = renderHook(() => useNotifications([upcoming] as Event[]));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications.length).toBe(1);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const now = new Date();
  const upcoming = [
    {
      id: 'a',
      title: 'event1',
      date: formatDate(new Date(now.getTime() + 5 * 60 * 1000)),
      startTime: parseHM(new Date(now.getTime() + 5 * 60 * 1000).getTime()),
      endTime: '23:59',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: 'b',
      title: 'event2',
      date: formatDate(new Date(now.getTime() + 7 * 60 * 1000)),
      startTime: parseHM(new Date(now.getTime() + 7 * 60 * 1000).getTime()),
      endTime: '23:59',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  const { result } = renderHook(() => useNotifications(upcoming as Event[]));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications.length).toBe(2);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications.length).toBe(1);
  expect(result.current.notifications[0].id).toBe('b');
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const now = new Date();
  const event = {
    id: 'unique',
    title: '중복 방지 이벤트',
    date: formatDate(new Date(now.getTime() + 5 * 60 * 1000)),
    startTime: parseHM(new Date(now.getTime() + 5 * 60 * 1000).getTime()),
    endTime: '23:59',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  const { result } = renderHook(() => useNotifications([event] as Event[]));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications.length).toBe(1);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications.length).toBe(0);

  act(() => {
    vi.advanceTimersByTime(10 * 60 * 1000);
  });

  expect(result.current.notifications.length).toBe(0);
});
