import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useNotifications } from '../../hooks/useNotifications';
import type { Event } from '../../types';
import { createNotificationMessage } from '../../utils/notificationUtils';
import { mockTestData } from '../data/mockTestData';

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-05-01T08:50:00'));
});

afterAll(() => {
  vi.useRealTimers();
});

describe('useNotifications hook notification 테스트', () => {
  // 10초 뒤에 시작, 알림은 10분 전
  const upcomingEvent = mockTestData;

  // 알림 시간이 아닌 이벤트
  const distantEvent: Event = {
    ...upcomingEvent,
    id: '2',
    startTime: '11:00:00', //2시간 뒤
    notificationTime: 5, // 5분 전
  };

  const events = [upcomingEvent, distantEvent];

  it('초기 상태에서는 notifications, notifiedEvents 모두 빈 배열이어야 한다', () => {
    const { result } = renderHook(() => useNotifications(events));
    expect(result.current.notifications).toEqual([]);
    expect(result.current.notifiedEvents).toEqual([]);
  });

  it('지정된 시간이 되면 알림이 하나 생성된다', () => {
    const { result } = renderHook(() => useNotifications(events));

    // 1초가 흐르면 checkUpcomingEvents가 한 번 호출됨
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // upcomingEvent만 알림에 올라와야 함
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toEqual({
      id: upcomingEvent.id,
      message: createNotificationMessage(upcomingEvent),
    });
    // notifiedEvents에도 기록
    expect(result.current.notifiedEvents).toEqual([upcomingEvent.id]);
  });

  it('removeNotification(index)로 개별 알림을 제거할 수 있다', () => {
    const { result } = renderHook(() => useNotifications(events));

    // 알림 생성
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.notifications).toHaveLength(1);

    // 제거
    act(() => {
      result.current.removeNotification(0);
    });
    expect(result.current.notifications).toEqual([]);
    // notifiedEvents는 유지 (한 번 보낸 기록은 지우지 않음)
    expect(result.current.notifiedEvents).toEqual([upcomingEvent.id]);
  });

  it('이미 알림을 보낸 이벤트는 중복 알림이 발생하지 않는다', () => {
    const { result } = renderHook(() => useNotifications(events));

    // 첫 번째 tick: 알림 발생
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.notifications).toHaveLength(1);

    // 두 번째 tick: 같은 이벤트여서 추가되지 않음
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.notifications).toHaveLength(1);
  });
});
