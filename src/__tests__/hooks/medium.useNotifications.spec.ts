import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

vi.useFakeTimers();

const now = new Date('2025-05-14T10:00:00');

vi.setSystemTime(now);

const makeEvent = (minsLater: number): Event => {
  const eventTime = new Date(now.getTime() + minsLater * 60 * 1000);

  return {
    id: `${minsLater}`,
    title: `Event in ${minsLater} mins`,
    date: formatDate(eventTime),
    startTime: parseHM(eventTime.getTime()),
    endTime: parseHM(eventTime.getTime()),
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 5,
  };
};

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));
  expect(result.current.notifications).toHaveLength(0);
  expect(result.current.notifiedEvents).toHaveLength(0);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const event = makeEvent(5);
  const { result } = renderHook(() => useNotifications([event]));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].id).toBe(event.id);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const event = makeEvent(5);
  const { result } = renderHook(() => useNotifications([event]));

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
  const event = makeEvent(5);
  const { result } = renderHook(() => useNotifications([event]));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);

  act(() => {
    vi.advanceTimersByTime(5000);
  });

  expect(result.current.notifications).toHaveLength(1);
});
