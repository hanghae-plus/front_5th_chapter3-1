import { act, renderHook } from '@testing-library/react';

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
    expect(result.current.holidays['2025-10-03']).toBe('개천절');
    expect(result.current.holidays['2025-10-09']).toBe('한글날');
  });
});

// week으로 적절하게 변영보다 자세히 작성
it("setView 함수를 사용하여 초기상태 'month'를 'week'으로 변경할 수 있다", () => {
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.setView('week');
  });
  expect(result.current.view).toBe('week');
});

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

it("주간 뷰에서 이전으로 navigate시 7일 후 '2025-09-24' 날짜로 지정이 된다", () => {
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.setView('week');
  });
  act(() => {
    result.current.navigate('prev');
  });
  assertDate(result.current.currentDate, new Date('2025-09-24'));
});

it("월간 뷰에서 다음으로 navigate시 한 달 전 '2025-11-01' 날짜여야 한다", () => {
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

it("currentDate가 '2025-01-01' 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다", async () => {
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.setCurrentDate(new Date('2025-01-01'));
  });
  expect(result.current.holidays['2025-01-01']).toBe('신정');
});
