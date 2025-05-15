import { act, renderHook } from '@testing-library/react';

import { mockEvents } from '../../__mocks__/response/mockEvents.json' assert { type: 'json' };
import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

const events = mockEvents as Event[];

/**@description useNotifications에 전달되는 mockEvent를 반환합니다.*/
const getMockEvent = (now: Date, startTime: string): Event => {
  return {
    id: '1',
    title: '이벤트1',
    date: formatDate(now),
    startTime: startTime,
    endTime: '23:50',
    description: '이벤트1',
    location: '회의실',
    category: '업무 이벤트1',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 10,
  };
};

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications([]));

    expect(result.current.notifications).toHaveLength(0);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
    const now = new Date();
    const startTime = parseHM(now.getTime() + 10 * 60 * 1000);

    const { result } = renderHook(() => useNotifications([getMockEvent(now, startTime)]));

    await act(() => vi.advanceTimersByTime(1000));

    expect(result.current.notifications).toHaveLength(1);
  });

  it('index를 기준으로 알림을 제거한다.', () => {
    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(0);

    act(() => {
      result.current.removeNotification(0); //index: 0
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
    const now = new Date();
    const startTime = parseHM(now.getTime() + 10 * 60 * 1000);

    const { result } = renderHook(() => useNotifications([getMockEvent(now, startTime)]));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);
  });
});
