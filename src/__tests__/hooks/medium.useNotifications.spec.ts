import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const events: Event[] = [];
    const { result } = renderHook(() => useNotifications(events));

    expect(result.current.notifications).toEqual([]);
    expect(result.current.notifiedEvents).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    // 현재 시간으로부터 5분 후에 알림이 발생하는 이벤트 생성
    const now = new Date();
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);

    const events: Event[] = [
      {
        id: '1',
        title: '테스트 이벤트',
        date: formatDate(now),
        startTime: `${parseHM(fiveMinutesLater.getTime())}`,
        endTime: `${parseHM(fiveMinutesLater.getTime() + 60 * 60 * 1000)}`,
        description: '테스트 설명',
        location: '테스트 장소',
        category: '테스트 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 5, // 5분 전에 알림
      },
    ];

    // 시간을 이벤트 시간보다 충분히 이전(10분 전)으로 설정
    const earlyTime = new Date(fiveMinutesLater.getTime() - 10 * 60 * 1000);
    vi.setSystemTime(earlyTime);

    const { result } = renderHook(() => useNotifications(events));

    // 초기에는 알림이 없어야 함
    expect(result.current.notifications).toEqual([]);

    // 시간을 진행시키지 않고 직접 checkUpcomingEvents 호출
    act(() => {
      // 현재 시간은 아직 알림이 생성되지 않아야 함
      result.current.checkUpcomingEvents();
    });
    expect(result.current.notifications).toEqual([]);

    // 현재 시간을 알림이 발생해야 하는 시점으로 변경
    const notificationTime = new Date(fiveMinutesLater.getTime() - 5 * 60 * 1000 + 1000); // 정확히 5분 전 + 1초
    vi.setSystemTime(notificationTime);

    // 이제 checkUpcomingEvents를 호출하면 알림이 생성되어야 함
    act(() => {
      result.current.checkUpcomingEvents();
    });

    expect(result.current.notifications.length).toBe(1);
    expect(result.current.notifications[0].id).toBe('1');
    expect(result.current.notifications[0].message).toBe('5분 후 테스트 이벤트 일정이 시작됩니다.');
    expect(result.current.notifiedEvents).toEqual(['1']);
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const events: Event[] = [];
    const { result } = renderHook(() => useNotifications(events));

    // 수동으로 알림 상태 설정
    act(() => {
      result.current.setNotifications([
        { id: '1', message: '알림 1' },
        { id: '2', message: '알림 2' },
        { id: '3', message: '알림 3' },
      ]);
    });

    expect(result.current.notifications.length).toBe(3);

    // 인덱스 1의 알림 제거
    act(() => {
      result.current.removeNotification(1);
    });

    expect(result.current.notifications.length).toBe(2);
    expect(result.current.notifications[0].id).toBe('1');
    expect(result.current.notifications[1].id).toBe('3');
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const now = new Date();
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);

    const events: Event[] = [
      {
        id: '1',
        title: '테스트 이벤트',
        date: formatDate(now),
        startTime: `${parseHM(fiveMinutesLater.getTime())}`,
        endTime: `${parseHM(fiveMinutesLater.getTime() + 60 * 60 * 1000)}`,
        description: '테스트 설명',
        location: '테스트 장소',
        category: '테스트 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 5, // 5분 전에 알림
      },
    ];

    // 알림을 발생시킬 시간으로 설정
    const notificationTime = new Date(fiveMinutesLater.getTime() - 5 * 60 * 1000 + 1000);
    vi.setSystemTime(notificationTime);

    const { result } = renderHook(() => useNotifications(events));

    // 초기에는 알림이 없어야 함
    expect(result.current.notifications).toEqual([]);

    // 알림 생성
    act(() => {
      result.current.checkUpcomingEvents();
    });

    expect(result.current.notifications.length).toBe(1);
    expect(result.current.notifiedEvents).toEqual(['1']);

    // 다시 checkUpcomingEvents를 호출해도 동일한 알림이 중복 생성되지 않아야 함
    act(() => {
      result.current.checkUpcomingEvents();
    });

    // 여전히 알림은 1개여야 함
    expect(result.current.notifications.length).toBe(1);
    expect(result.current.notifiedEvents).toEqual(['1']);
  });
});
