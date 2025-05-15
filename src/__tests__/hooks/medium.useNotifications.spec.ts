import { act, renderHook, waitFor } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { createTestEvent } from '../helpers/event.ts';
import { addMinutes, parseHM } from '../utils.ts';

const intervalCallbackSpy = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useInterval: (callback: () => void, delay: number) => {
      intervalCallbackSpy.mockImplementation(callback);

      if (delay !== null && callback) {
        setTimeout(callback, 0);
      }
    },
  };
});

describe('useNotifications', () => {
  beforeEach(() => {
    intervalCallbackSpy.mockClear();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const events: Event[] = [];

    const { result } = renderHook(() => useNotifications(events));

    expect(result.current.notifications).toEqual([]);
    expect(result.current.notifiedEvents).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
    const currentTime = new Date();

    const events = [
      createTestEvent({
        id: '1',
        title: '주간 회의',
        date: formatDate(currentTime),
        startTime: `${parseHM(addMinutes(currentTime, 15).getTime())}`,
        notificationTime: 15,
      }),
      createTestEvent({
        id: '2',
        title: '점심 식사',
        date: formatDate(currentTime),
        startTime: `${parseHM(addMinutes(currentTime, 30).getTime())}`,
        notificationTime: 10,
      }),
    ];

    const { result } = renderHook(() => useNotifications(events));

    await act(async () => {
      vi.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });

    expect(result.current.notifications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          message: '15분 후 주간 회의 일정이 시작됩니다.',
        }),
      ])
    );
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const events: Event[] = [];
    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.notifications).toHaveLength(0);

    act(() => {
      result.current.setNotifications([
        { id: '1', message: '알림 1' },
        { id: '2', message: '알림 2' },
      ]);
    });

    expect(result.current.notifications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: '1' }),
        expect.objectContaining({ id: '2' }),
      ])
    );

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: '2' })])
    );
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
    const currentTime = new Date();

    const events = [
      createTestEvent({
        id: '1',
        title: '주간 회의',
        date: formatDate(currentTime),
        startTime: parseHM(addMinutes(currentTime, 15).getTime()),
        notificationTime: 15,
      }),
    ];

    const { result, rerender } = renderHook(() => useNotifications(events));

    act(() => {
      vi.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.notifications).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: '1' })])
      );
    });

    expect(result.current.notifiedEvents).toEqual(['1']);

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toHaveLength(0);

    intervalCallbackSpy.mockClear();
    rerender();

    act(() => {
      vi.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(0);
    });
  });
});
