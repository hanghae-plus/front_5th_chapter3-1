import { act, renderHook } from '@testing-library/react';
import React from 'react';

import { EventProvider } from '../../context/event-context.tsx';
import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <EventProvider initialDate={new Date()} initialView="month">
    {children}
  </EventProvider>
);

describe('초기 상태', () => {
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView(), { wrapper });
    expect(result.current.view).toBe('month');
  });

  it('currentDate는 오늘 날짜여야 한다', () => {
    const { result } = renderHook(() => useCalendarView(), { wrapper });
    const today = new Date();

    assertDate(result.current.currentDate, today);
  });

  it('10월 달의 holidays는 개천절, 한글날을 포함해야 한다', () => {
    const { result } = renderHook(() => useCalendarView(), { wrapper });
    act(() => {
      result.current.setCurrentDate(new Date('2025-10-01'));
    });
    expect(result.current.holidays).toHaveProperty('2025-10-03', '개천절');
    expect(result.current.holidays).toHaveProperty('2025-10-09', '한글날');
  });
});

it("view를 'week'으로 변경 시 적절하게 반영된다", () => {
  const { result } = renderHook(() => useCalendarView(), { wrapper });
  act(() => {
    result.current.setView('week');
  });
  expect(result.current.view).toBe('week');
});

it('주간 뷰에서 다음으로 navigate시 7일 후 날짜로 지정이 된다', () => {
  const { result } = renderHook(() => useCalendarView(), { wrapper });
  act(() => {
    result.current.setView('week');
  });

  expect(result.current.view).toBe('week');

  act(() => {
    result.current.navigate('next');
  });

  const expectedDate = new Date();
  expectedDate.setDate(expectedDate.getDate() + 7);
  assertDate(result.current.currentDate, expectedDate);
});

it('주간 뷰에서 이전으로 navigate시 7일 전 날짜로 지정이 된다', () => {
  const { result } = renderHook(() => useCalendarView(), { wrapper });
  act(() => {
    result.current.setView('week');
  });

  expect(result.current.view).toBe('week');

  act(() => {
    result.current.navigate('prev');
  });

  const expectedDate = new Date();
  expectedDate.setDate(expectedDate.getDate() - 7);
  assertDate(result.current.currentDate, expectedDate);
});

it('월간 뷰에서 다음으로 navigate시 다음 달 1일로 지정이 된다', () => {
  const { result } = renderHook(() => useCalendarView(), { wrapper });
  act(() => {
    result.current.navigate('next');
  });

  const expectedDate = new Date();
  expectedDate.setMonth(expectedDate.getMonth() + 1);
  expectedDate.setDate(1);
  assertDate(result.current.currentDate, expectedDate);
});

it('월간 뷰에서 이전으로 navigate시 이전 달 1일로 지정이 된다', () => {
  const { result } = renderHook(() => useCalendarView(), { wrapper });
  act(() => {
    result.current.navigate('prev');
  });

  const expectedDate = new Date();
  expectedDate.setMonth(expectedDate.getMonth() - 1);
  expectedDate.setDate(1);
  assertDate(result.current.currentDate, expectedDate);
});

it("currentDate가 '2025-01-01' 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다", async () => {
  const { result } = renderHook(() => useCalendarView(), { wrapper });
  act(() => {
    result.current.setCurrentDate(new Date('2025-01-01'));
  });

  expect(result.current.holidays).toHaveProperty('2025-01-01', '신정');
});
