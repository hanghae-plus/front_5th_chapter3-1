import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications([]));
    expect(result.current.notifications).toHaveLength(0);
  });

  it('알림을 추가할 수 있다', () => {
    const { result } = renderHook(() => useNotifications([]));

    act(() => {
      result.current.setNotifications([
        {
          id: '1',
          message: '10분 후 팀 회의 일정이 시작됩니다.',
        },
      ]);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toMatchObject({
      id: '1',
      message: '10분 후 팀 회의 일정이 시작됩니다.',
    });
  });

  it('index를 기준으로 알림을 제거할 수 있다', () => {
    const { result } = renderHook(() => useNotifications([]));

    act(() => {
      result.current.setNotifications([
        {
          id: '1',
          message: '10분 후 팀 회의 일정이 시작됩니다.',
        },
        {
          id: '2',
          message: '10분 후 팀 회의 일정이 시작됩니다.',
        },
      ]);
    });

    expect(result.current.notifications).toHaveLength(2);

    act(() => {
      result.current.removeNotification(1);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toHaveProperty('id', '1');
  });

  it('알림 시간이 된 이벤트에 대해 알림이 생성되고 notifiedEvents에 추가된다', () => {
    // 현재 시간 설정
    const now = new Date('2025-07-01T13:50:00');
    vi.setSystemTime(now);

    // 10분 전 알림을 설정한 이벤트 (14:00 시작)
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-07-01',
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 회의',
        location: '회의실 A',
        category: '회의',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10, // 10분 전 알림
      },
    ];

    const { result } = renderHook(() => useNotifications(mockEvents));

    // 초기 상태 확인
    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.notifiedEvents).toHaveLength(0);

    // useInterval에 의해 checkUpcomingEvents가 호출되는 것을 시뮬레이션
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // 알림이 생성되었는지 확인
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toMatchObject({
      id: '1',
      message: '10분 후 팀 회의 일정이 시작됩니다.',
    });

    // notifiedEvents에 추가되었는지 확인
    expect(result.current.notifiedEvents).toHaveLength(1);
    expect(result.current.notifiedEvents[0]).toBe('1');

    // 알림 제거 기능 테스트
    act(() => {
      result.current.removeNotification(0);
    });

    // 알림은 제거되었지만 notifiedEvents는 유지되는지 확인
    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.notifiedEvents).toHaveLength(1);

    // 다시 interval이 실행되어도 이미 알림이 간 이벤트는 다시 알림이 가지 않는지 확인
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // 알림이 다시 생성되지 않았는지 확인
    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.notifiedEvents).toHaveLength(1);
  });
});
