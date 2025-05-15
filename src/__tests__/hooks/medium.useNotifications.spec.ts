import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { createMockEvent } from '../utils/mockEvent.ts';
import { parseHM } from '../utils.ts';

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));

  expect(result.current.notifications).toHaveLength(0);
  expect(result.current.notifiedEvents).toHaveLength(0);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const now = new Date();
  const future = new Date(now.getTime() + 60_000); // 1분 후

  const event = createMockEvent({
    title: '알림 생성 테스트',
    date: formatDate(future),
    startTime: parseHM(future.getTime()),
    notificationTime: 1,
  });

  const { result } = renderHook(() => useNotifications([event]));

  act(() => {
    result.current.checkUpcomingEvents();
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].message).toContain('알림 생성 테스트');
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications([]));

  act(() => {
    result.current.setNotifications([
      { id: '1', message: '알림 1' },
      { id: '2', message: '알림 2' },
    ]);
  });

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].id).toBe('2');
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const now = new Date();
  const future = new Date(now.getTime() + 60_000); // 1분 후

  const event: Event = createMockEvent({
    id: '1',
    title: '중복 알림 테스트',
    date: formatDate(future),
    startTime: parseHM(future.getTime()),
    notificationTime: 1,
  });

  const { result } = renderHook(() => useNotifications([event]));

  // 첫 알림 체크
  act(() => {
    result.current.checkUpcomingEvents();
  });

  expect(result.current.notifications).toHaveLength(1);

  // 다시 체크해도 알림은 중복 생성되지 않아야 함
  act(() => {
    result.current.checkUpcomingEvents();
  });

  expect(result.current.notifications).toHaveLength(1);
});
