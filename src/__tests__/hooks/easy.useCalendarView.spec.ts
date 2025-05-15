import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useCalendarView } from '../../hooks/useCalendarView.ts';

afterEach(() => {
  vi.useRealTimers();
});

describe('초기 상태', () => {
  const { result } = renderHook(() => useCalendarView());
  it('view는 "month"이어야 한다', () => {
    expect(result.current.view).toBe('month');
  });

  it('currentDate는 오늘 날짜인 "2025-10-01"이어야 한다', () => {
    const fakeDate = new Date('2025-10-01');
    vi.setSystemTime(fakeDate);
    const { result } = renderHook(() => useCalendarView());

    expect(result.current.currentDate).toEqual(fakeDate);
  });

  it('holidays는 10월 휴일인 개천절, 한글날이 지정되어 있어야 한다', () => {
    const fakeDate = new Date('2025-10-01');
    vi.setSystemTime(fakeDate);
    const { result } = renderHook(() => useCalendarView());

    expect(result.current.holidays).toMatchObject({
      '2025-10-03': '개천절',
      '2025-10-09': '한글날',
    });
  });
});

it("view를 'week'으로 변경하면 view는 'week'이어야 한다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => result.current.setView('week'));

  expect(result.current.view).toBe('week');
});

it("주간 뷰에서 다음으로 이동하면 currentDate는 7일 후인 '2025-10-08'이어야 한다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => result.current.setView('week'));
  act(() => result.current.navigate('next'));

  expect(result.current.currentDate).toEqual(new Date('2025-10-08'));
});

it("주간 뷰에서 이전으로 이동하면 currentDate는 7일 전인 '2025-09-24'이어야 한다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => result.current.setView('week'));
  act(() => result.current.navigate('prev'));

  expect(result.current.currentDate).toEqual(new Date('2025-09-24'));
});

it("월간 뷰에서 다음으로 이동하면 currentDate는 1개월 후인 '2025-11-01'이어야 한다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => result.current.setView('month'));
  act(() => result.current.navigate('next'));

  expect(result.current.currentDate).toEqual(new Date('2025-11-01'));
});

it("월간 뷰에서 이전으로 이동하면 currentDate는 1개월 전인 '2025-09-01'이어야 한다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => result.current.setView('month'));
  act(() => result.current.navigate('prev'));

  expect(result.current.currentDate).toEqual(new Date('2025-09-01'));
});

it("currentDate를 '2025-01-01'로 변경하면 휴일 정보가 '신정'으로 변경되어야 한다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => result.current.setCurrentDate(new Date('2025-01-01')));

  expect(result.current.holidays).toMatchObject({
    '2025-01-01': '신정',
  });
});
