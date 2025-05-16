import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

/**
 * @description useCalendarView
 * - 캘린더 뷰를 관리하기 위한 커스텀 훅
 */
describe('초기 상태', () => {
  /**
   * @description 기본 캘린더는 월간 캘린더이다.
   */
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.view).toBe('month');
  });

  it('currentDate는 오늘 날짜인 "2025-10-01"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    const currentDate = new Date('2025-10-01');
    assertDate(result.current.currentDate, currentDate);
  });

  it('holidays는 10월 휴일인 개천절, 한글날이 지정되어 있어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    const currentDate = new Date('2025-10-01');

    act(() => {
      result.current.setCurrentDate(currentDate);
    });

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

it("주간 뷰에서 다음으로 navigate시 7일 후 '2025-10-08' 날짜로 지정이 된다", () => {
  const { result } = renderHook(() => useCalendarView());

  const currentDate = new Date('2025-10-01');

  act(() => {
    result.current.setView('week');
    result.current.setCurrentDate(currentDate);
  });

  act(() => {
    result.current.navigate('next');
  });

  const nextDate = new Date('2025-10-08');
  assertDate(result.current.currentDate, nextDate);
});

it("주간 뷰에서 이전으로 navigate시 7일 후 '2025-09-24' 날짜로 지정이 된다", () => {
  const { result } = renderHook(() => useCalendarView());

  const currentDate = new Date('2025-10-01');

  act(() => {
    result.current.setView('week');
    result.current.setCurrentDate(currentDate);
  });

  act(() => {
    result.current.navigate('prev');
  });

  const prevDate = new Date('2025-09-24');
  assertDate(result.current.currentDate, prevDate);
});

it("월간 뷰에서 다음으로 navigate시 한 달 전 '2025-11-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());

  const currentDate = new Date('2025-10-01');

  act(() => {
    result.current.setView('month');
    result.current.setCurrentDate(currentDate);
  });

  act(() => {
    result.current.navigate('next');
  });

  const nextDate = new Date('2025-11-01');
  assertDate(result.current.currentDate, nextDate);
});

it("월간 뷰에서 이전으로 navigate시 한 달 전 '2025-09-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());

  const currentDate = new Date('2025-10-01');

  act(() => {
    result.current.setView('month');
    result.current.setCurrentDate(currentDate);
  });

  act(() => {
    result.current.navigate('prev');
  });

  const prevDate = new Date('2025-09-01');
  assertDate(result.current.currentDate, prevDate);
});

it("currentDate가 '2025-01-01' 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다", async () => {
  const { result } = renderHook(() => useCalendarView());

  const currentDate = new Date('2025-01-01');

  act(() => {
    result.current.setCurrentDate(currentDate);
  });

  expect(result.current.holidays).toEqual({
    '2025-01-01': '신정',
    '2025-01-29': '설날',
    '2025-01-30': '설날',
    '2025-01-31': '설날',
  });
});
