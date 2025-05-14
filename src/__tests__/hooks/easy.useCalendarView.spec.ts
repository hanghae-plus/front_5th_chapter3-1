import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-01'));
});

// 테스트 후 실행되는 설정
afterEach(() => {
  vi.useRealTimers();
});

describe('초기 상태', () => {
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.view).toBe('month');
  });

  it('현재날짜가 "2025-10-01"일때 캘린더에서 현재 날짜가 "2025-10-01"이어야 한다', () => {
    const currentDate = new Date('2025-10-01');
    vi.setSystemTime(currentDate);
    const { result } = renderHook(() => useCalendarView());
    assertDate(result.current.currentDate, currentDate);
  });

  it('10월 holidays는 개천절, 한글날이 지정되어 있어야 한다', () => {
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

it("캘린더 뷰를 'week'으로 변경 시 주간 캘린더로 바뀐다", () => {
  const { result } = renderHook(() => useCalendarView());
  expect(result.current.view).toBe('month');

  // 주간 캘린더로 변경
  act(() => {
    result.current.setView('week');
  });

  expect(result.current.view).toBe('week');
});

it("주간 뷰에서 다음 버튼 클릭 시, 7일 후 '2025-10-08' 날짜로 지정이 된다", () => {
  const { result } = renderHook(() => useCalendarView());
  // 주간 캘린더로 변경
  act(() => {
    result.current.setView('week');
  });
  assertDate(result.current.currentDate, new Date('2025-10-01'));

  // 다음 주차 버튼 클릭 이벤트
  act(() => {
    result.current.navigate('next');
  });

  assertDate(result.current.currentDate, new Date('2025-10-08'));
});

it("주간 뷰에서 이전 버튼 클릭 시, 7일 후 '2025-09-24' 날짜로 지정이 된다", () => {
  const { result } = renderHook(() => useCalendarView());
  // 주간 캘린더로 변경
  act(() => {
    result.current.setView('week');
  });
  assertDate(result.current.currentDate, new Date('2025-10-01'));

  // 다음 주차 버튼 클릭 이벤트
  act(() => {
    result.current.navigate('prev');
  });

  assertDate(result.current.currentDate, new Date('2025-09-24'));
});

it("월간 뷰에서 다음 버튼 클릭 시, 한 달 전 '2025-11-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());
  assertDate(result.current.currentDate, new Date('2025-10-01'));

  // 다음 주차 버튼 클릭 이벤트
  act(() => {
    result.current.navigate('next');
  });

  assertDate(result.current.currentDate, new Date('2025-11-01'));
});

it("월간 뷰에서 이전 버튼 클릭 시, 한 달 전 '2025-09-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());
  assertDate(result.current.currentDate, new Date('2025-10-01'));

  // 다음 주차 버튼 클릭 이벤트
  act(() => {
    result.current.navigate('prev');
  });

  assertDate(result.current.currentDate, new Date('2025-09-01'));
});

it("현재날짜가 '2025-01-01'로 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다", async () => {
  const { result } = renderHook(() => useCalendarView());

  expect(result.current.holidays).toEqual({
    '2025-10-03': '개천절',
    '2025-10-05': '추석',
    '2025-10-06': '추석',
    '2025-10-07': '추석',
    '2025-10-09': '한글날',
  });

  act(() => {
    result.current.setCurrentDate(new Date('2025-01-01'));
  });

  assertDate(result.current.currentDate, new Date('2025-01-01'));
  expect(result.current.holidays).toEqual({
    '2025-01-01': '신정',
    '2025-01-29': '설날',
    '2025-01-30': '설날',
    '2025-01-31': '설날',
  });
});
