import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

beforeEach(() => {
  const mockDate = new Date('2025-10-01');
  vi.useFakeTimers();
  vi.setSystemTime(mockDate);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('초기 상태', () => {
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.view).toBe('month');
  });

  it('currentDate는 오늘 날짜인 "2025-10-01"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    assertDate(result.current.currentDate, new Date('2025-10-01'));
  });

  it('holidays는 10월 휴일인 개천절, 한글날이 지정되어 있어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    expect(Object.values(result.current.holidays)).toContain('개천절');
    expect(Object.values(result.current.holidays)).toContain('한글날');
    expect(Object.keys(result.current.holidays)).toHaveLength(5);
  });
});

describe('뷰 변경', () => {
  it("view를 'week'으로 변경 시 적절하게 반영된다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setView('week');
    });
    expect(result.current.view).toBe('week');
  });
});

describe('주간 뷰 네비게이션', () => {
  it("주간 뷰에서 다음으로 navigate시 7일 후 '2025-10-08' 날짜로 지정이 된다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setView('week');
    });
    act(() => {
      result.current.navigate('next');
    });
    assertDate(result.current.currentDate, new Date('2025-10-08'));
  });

  it("주간 뷰에서 이전으로 navigate시 7일 전 '2025-09-24' 날짜로 지정이 된다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setView('week');
    });
    act(() => {
      result.current.navigate('prev');
    });
    assertDate(result.current.currentDate, new Date('2025-09-24'));
  });
});

describe('월간 뷰 네비게이션', () => {
  it("월간 뷰에서 다음으로 navigate시 한 달 후 '2025-11-01' 날짜여야 한다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.navigate('next');
    });
    assertDate(result.current.currentDate, new Date('2025-11-01'));
  });

  it("월간 뷰에서 이전으로 navigate시 한 달 전 '2025-09-01' 날짜여야 한다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.navigate('prev');
    });
    assertDate(result.current.currentDate, new Date('2025-09-01'));
  });
});

describe('날짜 변경 및 휴일 업데이트', () => {
  it("currentDate가 '2025-01-01'로 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setCurrentDate(new Date('2025-01-01'));
    });
    expect(result.current.currentDate).toEqual(new Date('2025-01-01'));
    expect(Object.values(result.current.holidays)).toContain('신정');
    expect(Object.values(result.current.holidays)).toContain('설날');
    expect(Object.keys(result.current.holidays)).toHaveLength(4);
  });
});
