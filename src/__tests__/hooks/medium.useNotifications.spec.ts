import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

act;
renderHook;
useNotifications;
formatDate;
parseHM; // ? >> 00:00 함수

const common: Event = {
  id: '1',
  title: '',
  date: '2025-10-01',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  category: '',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 0,
};

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));
  expect(result.current.notifications.length).toBe(0);
  expect(result.current.notifiedEvents.length).toBe(0);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const events: Event[] = [
    {
      ...common,
      startTime: '01:00',
      endTime: '02:00',
      notificationTime: 10, // minute
    },
  ];
  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications.length).toBe(0);
  expect(result.current.notifiedEvents.length).toBe(0);

  act(() => {
    vi.advanceTimersByTime(50 * 60 * 1_000);
  });

  expect(result.current.notifications.length).toBe(1);
  expect(result.current.notifications[0].id).toBe('1');
  expect(result.current.notifiedEvents.length).toBe(1);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const events: Event[] = [
    { ...common, id: '1', startTime: '00:30', endTime: '01:00', notificationTime: 10 },
    { ...common, id: '2', startTime: '01:00', endTime: '01:30', notificationTime: 40 },
  ];
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(20 * 60 * 1_000);
  });

  expect(result.current.notifications.length).toBe(2);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications.length).toBe(1);
  expect(result.current.notifications[0].id).toBe('2');
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const events: Event[] = [
    { ...common, id: '1', startTime: '00:30', endTime: '01:00', notificationTime: 10 },
  ];
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(20 * 60 * 1_000);
  });

  expect(result.current.notifications.length).toBe(1);

  act(() => {
    vi.advanceTimersByTime(5 * 60 * 1_000);
  });

  expect(result.current.notifications.length).toBe(1);
});
