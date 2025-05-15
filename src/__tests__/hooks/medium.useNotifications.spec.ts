import { renderHook, act } from '@testing-library/react';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

import { events } from '../../__mocks__/response/realEvents.json';
import { useNotifications } from '../../hooks/useNotifications';
import { Event } from '../../types';

const mockEvents = events as Event[];

// 🔧 테스트 환경 세팅
beforeEach(() => {
  vi.useRealTimers(); //  이전 테스트가 가짜 타이머 상태였다면 초기화
  vi.useFakeTimers(); // ⏱️새 테스트용 가짜 타이머 시작
  vi.setSystemTime(new Date('2025-05-20T09:59:00'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useNotifications', () => {
  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));
    expect(result.current.notifications).toEqual([]);
  });

  it('지정된 시간이 되면 알림이 생성된다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);
  });

  it('index를 기준으로 알림을 제거할 수 있다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않는다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.notifications).toHaveLength(1);
  });
});
