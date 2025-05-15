import { act, renderHook } from '@testing-library/react';
import { vi, describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event, RepeatType } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

describe('useNotifications 훅', () => {
    // 타이머 가짜로 제어
    beforeAll(() => {
      vi.useFakeTimers();
    });
    // 매 테스트마다 기준 시각을 고정
    beforeEach(() => {
      // 2025-05-15 10:00:00 UTC를 기준으로
      vi.setSystemTime(new Date('2025-05-15T10:00:00Z'));
    });
    afterAll(() => {
      vi.useRealTimers();
    });
  
    // 공통 이벤트 정보
    const baseEvent: Omit<Event, 'startTime'> = {
      id: '1',
      title: 'Test',
      date: formatDate(new Date()),       // "2025-05-15"
      endTime: '11:00',
      description: '테스트 일정',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 5,                // 5분 전 알림
    };
  
    it('초기 상태에서는 알림이 없어야 한다', () => {
      const { result } = renderHook(() => useNotifications([]));
      expect(result.current.notifications).toEqual([]);
      expect(result.current.notifiedEvents).toEqual([]);
    });
  
    it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
      const events: Event[] = [
        {
          ...baseEvent,
          // 10:05 에 시작하는 일정이므로,
          // 기준 시각(10:00)에서 notificationTime(5분) 후에 알림 발생
          startTime: parseHM(Date.parse('2025-05-15T10:05:00Z')),
        },
      ];
  
      const { result } = renderHook(() => useNotifications(events));
  
      // 1초 후에 checkUpcomingEvents 가 호출됨
      act(() => {
        vi.advanceTimersByTime(1000);
      });
  
      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0]).toEqual({
        id: '1',
        message: '5분 후 Test 일정이 시작됩니다.',
      });
      // 한번 알림이 발생한 이벤트는 notifiedEvents에 추가된다
      expect(result.current.notifiedEvents).toContain('1');
    });
  
    it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
      const events: Event[] = [
        {
          ...baseEvent,
          startTime: parseHM(Date.parse('2025-05-15T10:05:00Z')),
        },
      ];
      const { result } = renderHook(() => useNotifications(events));
  
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.notifications).toHaveLength(1);
  
      // removeNotification 으로 첫 번째(0번) 알림 제거
      act(() => {
        result.current.removeNotification(0);
      });
      expect(result.current.notifications).toHaveLength(0);
    });
  
    it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
      const events: Event[] = [
        {
          ...baseEvent,
          startTime: parseHM(Date.parse('2025-05-15T10:05:00Z')),
        },
      ];
      const { result } = renderHook(() => useNotifications(events));
  
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.notifications).toHaveLength(1);
  
      // 다시 타이머가 돌아가도 새로운 알림은 추가되지 않아야 함
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.notifications).toHaveLength(1);
    });
  });