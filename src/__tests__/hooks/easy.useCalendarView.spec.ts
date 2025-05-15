import { act, renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { useCalendarView } from '../../hooks/useCalendarView';

// fetchHolidays 함수를 모킹
vi.mock('../../apis/fetchHolidays', () => ({
  fetchHolidays: (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (month === 1) {
      // 1월
      return {
        [`${year}-01-01`]: '신정',
        [`${year}-01-29`]: '설날',
        [`${year}-01-30`]: '설날',
        [`${year}-01-31`]: '설날',
      };
    } else if (month === 10) {
      // 10월
      return {
        [`${year}-10-03`]: '개천절',
        [`${year}-10-05`]: '추석',
        [`${year}-10-06`]: '추석',
        [`${year}-10-07`]: '추석',
        [`${year}-10-09`]: '한글날',
      };
    }
    return {};
  },
}));

describe('useCalendarView', () => {
  const MOCK_SYSTEM_TIME = '2025-10-01T00:00:00.000Z';

  // 모든 테스트에서 한 번만 타이머 설정
  beforeAll(() => {
    vi.useFakeTimers();
  });

  // 각 테스트 전에 시스템 시간 재설정
  beforeEach(() => {
    vi.setSystemTime(new Date(MOCK_SYSTEM_TIME));
  });

  // 모든 테스트가 끝난 후 실제 타이머로 복원
  afterAll(() => {
    vi.useRealTimers();
  });

  describe('초기 상태', () => {
    it('view는 "month"이어야 한다', () => {
      const { result } = renderHook(() => useCalendarView());
      expect(result.current.view).toBe('month');
    });

    it('currentDate는 오늘 날짜인 "2025-10-01"이어야 한다', () => {
      const { result } = renderHook(() => useCalendarView());
      expect(result.current.currentDate.toISOString()).toBe(MOCK_SYSTEM_TIME);
    });

    it('holidays는 10월 휴일인 개천절, 한글날이 지정되어 있어야 한다', () => {
      const { result } = renderHook(() => useCalendarView());
      expect(result.current.holidays).toEqual({
        '2025-10-03': '개천절',
        '2025-10-05': '추석',
        '2025-10-06': '추석',
        '2025-10-07': '추석',
        '2025-10-09': '한글날',
      });
    });
  });

  it("view를 'week'으로 변경 시 적절하게 반영된다", () => {
    const { result } = renderHook(() => useCalendarView());

    act(() => {
      result.current.setView('week');
    });

    expect(result.current.view).toBe('week');
  });

  describe('navigate 기능', () => {
    it('주간 뷰에서 다음으로 navigate시 7일 후 날짜로 지정이 된다', () => {
      const { result } = renderHook(() => useCalendarView());

      act(() => {
        result.current.setView('week');
      });

      act(() => {
        result.current.navigate('next');
      });

      const expectedDate = new Date('2025-10-08T00:00:00.000Z');
      expect(result.current.currentDate.toISOString()).toBe(expectedDate.toISOString());
    });

    it('주간 뷰에서 이전으로 navigate시 7일 전 날짜로 지정이 된다', () => {
      const { result } = renderHook(() => useCalendarView());

      act(() => {
        result.current.setView('week');
      });

      act(() => {
        result.current.navigate('prev');
      });

      const expectedDate = new Date('2025-09-24T00:00:00.000Z');
      expect(result.current.currentDate.toISOString()).toBe(expectedDate.toISOString());
    });

    it('월간 뷰에서 다음으로 navigate시 한 달 후 1일 날짜여야 한다', () => {
      const { result } = renderHook(() => useCalendarView());

      act(() => {
        result.current.navigate('next');
      });

      const expectedDate = new Date('2025-11-01T00:00:00.000Z');
      expect(result.current.currentDate.toISOString()).toBe(expectedDate.toISOString());
    });

    it('월간 뷰에서 이전으로 navigate시 한 달 전 1일 날짜여야 한다', () => {
      const { result } = renderHook(() => useCalendarView());

      act(() => {
        result.current.navigate('prev');
      });

      const expectedDate = new Date('2025-09-01T00:00:00.000Z');
      expect(result.current.currentDate.toISOString()).toBe(expectedDate.toISOString());
    });
  });

  // 별도의 describe 블록으로 비동기 테스트 분리
  describe('휴일 업데이트', () => {
    // 이 테스트만을 위한 타이머 설정
    beforeEach(() => {
      vi.useRealTimers(); // 실제 타이머로 전환하여 비동기 작업이 제대로 처리되도록 함
    });

    afterEach(() => {
      vi.useFakeTimers(); // 다시 가짜 타이머로 복원
      vi.setSystemTime(new Date(MOCK_SYSTEM_TIME));
    });

    it("currentDate가 '2025-01-01'로 변경되면 1월 휴일로 업데이트되어야 한다", async () => {
      const { result } = renderHook(() => useCalendarView());

      act(() => {
        result.current.setCurrentDate(new Date('2025-01-01T00:00:00.000Z'));
      });

      // @testing-library/react의 waitFor 사용
      await waitFor(() => {
        expect(Object.keys(result.current.holidays).length).toBeGreaterThan(0);
      });

      expect(result.current.holidays).toEqual({
        '2025-01-01': '신정',
        '2025-01-29': '설날',
        '2025-01-30': '설날',
        '2025-01-31': '설날',
      });
    });
  });
});
