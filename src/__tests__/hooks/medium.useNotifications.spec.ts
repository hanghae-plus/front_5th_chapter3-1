import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

const MOCK_EVENT: Event = {
  id: '1',
  title: '1번 이벤트',
  date: '2025-05-01',
  startTime: '10:00',
  endTime: '11:00',
  description: '1번 이벤트 설명',
  location: '1번 이벤트 장소',
  category: '1번 이벤트 카테고리',
  repeat: {
    type: 'none',
    interval: 0,
  },
  notificationTime: 10,
};

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result: notifications } = renderHook(() => useNotifications([]));

  expect(notifications.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  vi.useFakeTimers();

  const eventTime = new Date(new Date().getTime() + 1000 * 60);
  const { result: notifications } = renderHook(() =>
    useNotifications([
      {
        ...MOCK_EVENT,
        date: formatDate(eventTime),
        startTime: parseHM(eventTime.getTime()),
        endTime: parseHM(eventTime.getTime() + 1000 * 60),
        notificationTime: 1,
        location: '새로운 장소',
        category: '미팅',
        description: '새로운 테스트 설명',
      },
    ])
  );

  expect(notifications.current.notifications).toHaveLength(0);

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(notifications.current.notifications).toHaveLength(1);
  expect(notifications.current.notifications[0].id).toBe('1');
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result: notifications } = renderHook(() => useNotifications([MOCK_EVENT]));

  act(() => {
    notifications.current.removeNotification(0);
  });

  expect(notifications.current.notifications).toEqual([]);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-03-21T13:50:00'));

  const { result: notifications } = renderHook(() =>
    useNotifications([
      {
        ...MOCK_EVENT,
        date: '2024-03-21',
        startTime: '14:00',
        endTime: '15:00',
      },
    ])
  );

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(notifications.current.notifications).toHaveLength(1);

  act(() => {
    vi.advanceTimersByTime(5000);
  });

  expect(notifications.current.notifications).toHaveLength(1);

  vi.useRealTimers();
});
