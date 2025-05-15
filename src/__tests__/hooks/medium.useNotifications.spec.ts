import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { createNotificationMessage } from '../../utils/notificationUtils.ts';
import { makeEvents, parseHM } from '../utils';

describe('useNotifications', () => {
  const startDate = new Date('2025-10-09 10:30');
  const endDate = new Date('2025-10-09 11:30');
  let events: Event[] = [];

  beforeEach(() => {
    vi.useFakeTimers();

    events = makeEvents(4).map((event) => ({
      ...event,
      date: formatDate(startDate),
      startTime: parseHM(startDate.getTime()),
      endTime: parseHM(endDate.getTime()),
    }));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(events));

    expect(result.current.notifications).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const targetTime = startDate.setMinutes(startDate.getMinutes() - 10);
    vi.setSystemTime(targetTime);

    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(result.current.notifications).toEqual(
      events.map((event) => ({
        id: event.id,
        message: createNotificationMessage(event),
      }))
    );
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const targetTime = startDate.setMinutes(startDate.getMinutes() - 10);
    vi.setSystemTime(targetTime);

    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    const INDEX = 1;

    act(() => {
      result.current.removeNotification(INDEX);
    });

    expect(result.current.notifications).toEqual(
      events
        .filter((_, index) => index !== INDEX)
        .map((event) => ({
          id: event.id,
          message: createNotificationMessage(event),
        }))
    );
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const targetTime = startDate.setMinutes(startDate.getMinutes() - 10);
    vi.setSystemTime(targetTime);

    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(result.current.notifications).toEqual(
      events.map((event) => ({
        id: event.id,
        message: createNotificationMessage(event),
      }))
    );
  });
});
