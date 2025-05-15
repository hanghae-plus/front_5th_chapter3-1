import { renderHook, act } from '@testing-library/react';

import { useCalendarView } from '../hooks/useCalendarView';
import { getNavigatedDate } from '../utils/dateUtils';

// 1. getNavigatedDate: 주간 이동(이전)
test('getNavigatedDate - week prev', () => {
  const base = new Date('2025-05-14');
  const result = getNavigatedDate(base, 'week', 'prev');
  expect(result.getDate()).toBe(base.getDate() - 7);
});

// 2. getNavigatedDate: 월간 이동(다음)
test('getNavigatedDate - month next', () => {
  const base = new Date('2025-05-14');
  const result = getNavigatedDate(base, 'month', 'next');
  expect(result.getMonth()).toBe(5); // 0-indexed, 5=June
  expect(result.getDate()).toBe(1);
});

// 3. useCalendarView: 초기 상태 확인
test('useCalendarView - 초기 상태', () => {
  const { result } = renderHook(() => useCalendarView());
  expect(result.current.view).toBe('month');
  expect(result.current.currentDate).toBeInstanceOf(Date);
  expect(typeof result.current.holidays).toBe('object');
});

// 4. useCalendarView: navigate로 주간 이동
test('useCalendarView - navigate week next', () => {
  const { result } = renderHook(() => useCalendarView());
  const prevDate = result.current.currentDate;
  act(() => {
    result.current.navigate('next');
  });
  expect(result.current.currentDate.getDate()).toBe(prevDate.getDate());
});

// 5. useCalendarView: setView로 뷰 변경
test('useCalendarView - setView', () => {
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.setView('week');
  });
  expect(result.current.view).toBe('week');
});
