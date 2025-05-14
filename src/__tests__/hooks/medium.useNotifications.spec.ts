import { act, renderHook } from '@testing-library/react';

import { Event } from '../../types';
import { useNotifications } from '../../hooks/useNotifications.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));
  expect(result.current.notifications).toHaveLength(0);
  expect(result.current.notifiedEvents).toHaveLength(0);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const mockDateTime = new Date('2025-05-28');
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: formatDate(mockDateTime),
      startTime: parseHM(mockDateTime.getTime()),
      endTime: parseHM(mockDateTime.getTime() + 10 * 60 * 1000),
      description: 'event1',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 5,
    },
  ];
  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications).toHaveLength(0);

  act(() => {
    vi.setSystemTime(new Date(mockDateTime.getTime() - 5 * 60 * 1000));
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toHaveLength(1);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications([]));

  act(() => {
    result.current.setNotifications([
      { id: '1', message: '첫 번째 메시지' },
      { id: '2', message: '두 번째 메시지' },
    ]);
  });

  expect(result.current.notifications).toHaveLength(2);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].message).toBe('두 번째 메시지');
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const mockDateTime = new Date('2025-05-28');
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: formatDate(mockDateTime),
      startTime: parseHM(mockDateTime.getTime()),
      endTime: parseHM(mockDateTime.getTime() + 10 * 60 * 1000),
      description: 'event1',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 5,
    },
  ];

  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications).toHaveLength(0);

  act(() => {
    vi.setSystemTime(new Date(mockDateTime.getTime() - 5 * 60 * 1000));
    vi.advanceTimersByTime(1000);
  });

  act(() => {
    vi.advanceTimersByTime(10 * 60 * 1000);
  });

  expect(result.current.notifications).toHaveLength(1);
});
