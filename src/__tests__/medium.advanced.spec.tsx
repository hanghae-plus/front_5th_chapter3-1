import { renderHook, act } from '@testing-library/react';

import { useCalendarView } from '../hooks/useCalendarView';
import { getNavigatedDate } from '../utils/dateUtils';

test('주별 이동', () => {
  const base = new Date('2025-05-14');
  const result = getNavigatedDate(base, 'week', 'prev');
  expect(result.getDate()).toBe(base.getDate() - 7);
});

test('월별 이동', () => {
  const base = new Date('2025-05-14');
  const result = getNavigatedDate(base, 'month', 'next');
  expect(result.getMonth()).toBe(5);
  expect(result.getDate()).toBe(1);
});

test('캘린더 초기 상태', () => {
  const { result } = renderHook(() => useCalendarView());
  expect(result.current.view).toBe('month');
  expect(result.current.currentDate).toBeInstanceOf(Date);
  expect(typeof result.current.holidays).toBe('object');
});

test('캘린더 navigate으로 주별 이동', () => {
  const { result } = renderHook(() => useCalendarView());
  const prevDate = result.current.currentDate;
  act(() => {
    result.current.navigate('next');
  });
  expect(result.current.currentDate.getDate()).toBe(prevDate.getDate());
});

test('캘린더 setView', () => {
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.setView('week');
  });
  expect(result.current.view).toBe('week');
});
