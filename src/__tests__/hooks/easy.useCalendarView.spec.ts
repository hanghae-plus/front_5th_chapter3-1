import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

describe('useCalendarView Hook', () => {
  const MOCK_INITIAL_DATE = new Date(2025, 9, 1); // 2025년 10월 1일

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_INITIAL_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('초기 상태', () => {
    it('view는 "month"이어야 한다', () => {
      const { result } = renderHook(() => useCalendarView());
      expect(result.current.view).toBe('month');
    });

    it('currentDate는 설정된 초기 날짜(2025-10-01)여야 한다', () => {
      const { result } = renderHook(() => useCalendarView());
      assertDate(result.current.currentDate, MOCK_INITIAL_DATE);
    });

    it('holidays는 초기 날짜(10월) 기준 휴일인 개천절, 한글날을 포함해야 한다', () => {
      const { result } = renderHook(() => useCalendarView());
      expect(result.current.holidays).toEqual(
        expect.objectContaining({
          '2025-10-03': '개천절',
          '2025-10-09': '한글날',
        })
      );
    });
  });

  describe('뷰 변경', () => {
    it("setView를 사용하여 view를 'week'으로 변경 시 반영된다", () => {
      const { result } = renderHook(() => useCalendarView());
      act(() => {
        result.current.setView('week');
      });
      expect(result.current.view).toBe('week');
    });
  });

  describe('네비게이션', () => {
    describe('주간 뷰', () => {
      it("다음(next)으로 navigate시 현재 날짜가 7일 후('2025-10-08')로 변경된다", () => {
        const { result } = renderHook(() => useCalendarView());
        act(() => {
          result.current.setView('week');
        });
        act(() => {
          result.current.navigate('next');
        });
        assertDate(result.current.currentDate, new Date(2025, 9, 8));
      });

      it("이전(prev)으로 navigate시 현재 날짜가 7일 전('2025-09-24')으로 변경된다", () => {
        const { result } = renderHook(() => useCalendarView());
        act(() => {
          result.current.setView('week');
        });
        act(() => {
          result.current.navigate('prev');
        });
        assertDate(result.current.currentDate, new Date(2025, 8, 24)); // 9월 24일
      });
    });

    describe('월간 뷰', () => {
      it("다음(next)으로 navigate시 현재 날짜가 다음 달 1일('2025-11-01')로 변경된다", () => {
        const { result } = renderHook(() => useCalendarView()); // 기본 월간 뷰
        act(() => {
          result.current.navigate('next');
        });
        assertDate(result.current.currentDate, new Date(2025, 10, 1)); // 11월 1일
      });

      it("이전(prev)으로 navigate시 현재 날짜가 이전 달 1일('2025-09-01')로 변경된다", () => {
        const { result } = renderHook(() => useCalendarView()); // 기본 월간 뷰
        act(() => {
          result.current.navigate('prev');
        });
        assertDate(result.current.currentDate, new Date(2025, 8, 1)); // 9월 1일
      });
    });
  });

  describe('날짜 변경에 따른 휴일 업데이트', () => {
    it("currentDate가 '2025-01-01'로 변경되면 holidays가 1월 휴일('신정')을 포함하도록 업데이트되어야 한다", () => {
      // 시스템 시간을 1월 1일로 설정하여 훅이 해당 날짜 기준으로 초기화되도록 함
      vi.setSystemTime(new Date(2025, 0, 1));

      const { result } = renderHook(() => useCalendarView(), {
        initialProps: { date: new Date(2025, 0, 1) },
      });

      expect(result.current.holidays).toEqual(
        expect.objectContaining({
          '2025-01-01': '신정',
        })
      );
    });
  });
});
