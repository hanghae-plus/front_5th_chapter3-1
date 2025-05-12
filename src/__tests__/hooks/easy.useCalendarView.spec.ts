import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

describe('캘린더', () => {
  /**
   * @description view는 "month"이어야 한다 -> 기본 캘린더 상태 종류는 월간 캘린더이다
   */
  it('기본 캘린더 상태 종류는 월간 캘린더이다', () => {
    const { result } = renderHook(() => useCalendarView());

    expect(result.current.view).toBe('month');
  });

  describe('월간 캘린더', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    /**
     * @description currentDate는 오늘 날짜인 "2025-10-01"이어야 한다 -> 월간 캘린더에서 현재 날짜가 2025-10-01일 때, 현재 날짜는 2025-10-01일 이어야 한다
     */
    it('월간 캘린더에서 현재 날짜가 2025-10-01일 때, 현재 날짜는 2025-10-01일 이어야 한다', () => {
      const currentDate = new Date('2025-10-01');
      vi.setSystemTime(currentDate);

      const { result } = renderHook(() => useCalendarView());

      assertDate(result.current.currentDate, currentDate);
    });

    /**
     * @description holidays는 2025년 10월 휴일인 개천절, 추석, 한글날이 지정되어 있어야 한다 -> 월간 캘린더에서 현재 날짜가 2025-10-01일 때, 휴일은 2025년 10월 휴일인 개천절, 추석, 한글날이 지정되어 있어야 한다
     */
    it('월간 캘린더에서 현재 날짜가 2025-10-01일 때, 휴일은 2025년 10월 휴일인 개천절, 추석, 한글날이 지정되어 있어야 한다', () => {
      const currentDate = new Date('2025-10-01');
      vi.setSystemTime(currentDate);

      const { result } = renderHook(() => useCalendarView());

      expect(result.current.holidays).toEqual({
        '2025-10-03': '개천절',
        '2025-10-09': '한글날',
        '2025-10-05': '추석',
        '2025-10-06': '추석',
        '2025-10-07': '추석',
      });
    });

    /**
     * @description 월간 뷰에서 다음으로 navigate시 한 달 전 '2025-11-01' 날짜여야 한다 -> 월간 캘린더에서 현재 날짜가 2025-10-01일 때, 다음 클릭시 한 달 후 '2025-11-01' 날짜로 지정이 된다
     */
    it("월간 캘린더에서 현재 날짜가 2025-10-01일 때, 다음 클릭시 한 달 후 '2025-11-01' 날짜로 지정이 된다", () => {
      const currentDate = new Date('2025-10-01');
      const nextMonthDate = new Date('2025-11-01');
      vi.setSystemTime(currentDate);

      const { result } = renderHook(() => useCalendarView());

      act(() => {
        result.current.navigate('next');
      });

      assertDate(result.current.currentDate, nextMonthDate);
    });

    /**
     * @description 월간 뷰에서 이전으로 navigate시 한 달 전 '2025-09-01' 날짜여야 한다 -> 월간 캘린더에서 현재 날짜가 2025-10-01일 때, 이전 클릭시 한 달 전 '2025-09-01' 날짜로 지정이 된다
     */
    it("월간 캘린더에서 현재 날짜가 2025-10-01일 때, 이전 클릭시 한 달 전 '2025-09-01' 날짜로 지정이 된다", () => {
      const currentDate = new Date('2025-10-01');
      const prevMonthDate = new Date('2025-09-01');
      vi.setSystemTime(currentDate);

      const { result } = renderHook(() => useCalendarView());

      act(() => {
        result.current.navigate('prev');
      });

      assertDate(result.current.currentDate, prevMonthDate);
    });

    /**
     * @description currentDate가 '2025-01-01' 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다 -> 현재 날짜가 2025-01로 변경되면, 1월 신정, 설날의 휴일이 새로 갱신된다.
     */
    it('현재 날짜가 2025-01로 변경되면, 1월 신정, 설날의 휴일이 새로 갱신된다.', async () => {
      const currentDate = new Date('2025-01-01');
      vi.setSystemTime(currentDate);

      const { result } = renderHook(() => useCalendarView());

      expect(result.current.holidays).toEqual({
        '2025-01-01': '신정',
        '2025-01-29': '설날',
        '2025-01-30': '설날',
        '2025-01-31': '설날',
      });
    });
  });

  describe('주간 캘린더', () => {
    /**
     * @description view를 'week'으로 변경 시 적절하게 반영된다 -> 캘린더 종류를 주간으로 변경시 주간 캘린더로 변경된다
     */
    it('캘린더 종류를 주간으로 변경시 주간 캘린더로 변경된다', () => {
      const { result } = renderHook(() => useCalendarView());

      act(() => {
        result.current.setView('week');
      });

      expect(result.current.view).toBe('week');
    });

    /**
     * @description 주간 뷰에서 다음으로 navigate시 7일 후 '2025-10-08' 날짜로 지정이 된다 -> 주간 캘린더에서 현재 날짜가 2025-10-01일 때, 다음 클릭시 7일 후 '2025-10-08' 날짜로 지정이 된다
     */
    it("주간 캘린더에서 현재 날짜가 2025-10-01일 때, 다음 클릭시 7일 후 '2025-10-08' 날짜로 지정이 된다", () => {
      const currentDate = new Date('2025-10-01');
      const nextWeekDate = new Date('2025-10-08');
      vi.setSystemTime(currentDate);

      const { result } = renderHook(() => useCalendarView());

      act(() => {
        result.current.setView('week');
      });

      act(() => {
        result.current.navigate('next');
      });

      assertDate(result.current.currentDate, nextWeekDate);
    });

    /**
     * @description 주간 뷰에서 이전으로 navigate시 7일 후 '2025-09-24' 날짜로 지정이 된다 -> 주간 캘린더에서 현재 날짜가 2025-10-01일 때, 이전 클릭시 7일 전 '2025-09-24' 날짜로 지정이 된다
     */
    it("주간 캘린더에서 현재 날짜가 2025-10-01일 때, 이전 클릭시 7일 전 '2025-09-24' 날짜로 지정이 된다", () => {
      const currentDate = new Date('2025-10-01');
      const prevWeekDate = new Date('2025-09-24');
      vi.setSystemTime(currentDate);

      const { result } = renderHook(() => useCalendarView());

      act(() => {
        result.current.setView('week');
      });

      act(() => {
        result.current.navigate('prev');
      });

      assertDate(result.current.currentDate, prevWeekDate);
    });
  });
});
