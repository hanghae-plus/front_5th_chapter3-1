import { act, renderHook } from '@testing-library/react';

import eventsData from '../../__mocks__/response/events.json';
import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { createNotificationMessage } from '../../utils/notificationUtils.ts';
import { parseHM } from '../utils.ts';

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));
  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
  vi.useFakeTimers();
  vi.setSystemTime('2025-07-01T08:50:00');

  const events = [...eventsData.events] as Event[];
  const { result } = renderHook(() => useNotifications(events));
  expect(result.current.notifications).toEqual([]);

  await act(async () => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toEqual([
    {
      id: events[0].id,
      message: createNotificationMessage(events[0]),
    },
  ]);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
  vi.useFakeTimers();
  vi.setSystemTime('2025-07-01T08:50:00');

  const events = [...eventsData.events] as Event[];
  const { result } = renderHook(() => useNotifications(events));

  await act(async () => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toEqual([
    {
      id: events[0].id,
      message: createNotificationMessage(events[0]),
    },
  ]);

  await act(async () => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toEqual([]);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {});
