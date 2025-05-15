import { act, renderHook } from '@testing-library/react';

import { formatDate } from '../../based/utils/dateUtils.ts';
import { useCalendarView } from '../../features/event/model/useCalendarView.ts';

describe('초기 상태', () => {
  it('view의 기본값은 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    expect(result.current.view).toBe('month');
  });

  it('currentDate는 오늘 날짜여야 한다.', () => {
    const { result } = renderHook(() => useCalendarView());

    const testDate = formatDate(result.current.currentDate);
    const today = formatDate(new Date());

    expect(testDate).toBe(today);
  });

  it('holidays는 해당 월의 휴일이 지정되어 있어야 한다.', () => {
    const { result } = renderHook(() => useCalendarView());

    act(() => {
      result.current.setCurrentDate(new Date('2025-10-01'));
    });

    const { holidays } = result.current;

    const SEPTEMBER_HOLIDAYS = {
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-03': '개천절',
      '2025-10-09': '한글날',
    };

    expect(holidays).toEqual(SEPTEMBER_HOLIDAYS);
  });
});

it('view를 "week"으로 변경이 가능하다.', () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });

  expect(result.current.view).toBe('week');
});

it("주간 뷰에서 다음으로 navigate시 7일 후 '2025-10-08' 날짜로 지정이 된다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setCurrentDate(new Date('2025-10-01'));
  });

  act(() => {
    result.current.setView('week');
  });

  act(() => {
    result.current.navigate('next');
  });

  expect(formatDate(result.current.currentDate)).toBe('2025-10-08');
});

it("주간 뷰에서 이전으로 navigate시 7일 후 '2025-09-24' 날짜로 지정이 된다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setCurrentDate(new Date('2025-10-01'));
  });

  act(() => {
    result.current.setView('week');
  });

  act(() => {
    result.current.navigate('prev');
  });

  expect(formatDate(result.current.currentDate)).toBe('2025-09-24');
});

it("월간 뷰에서 다음으로 navigate시 한 달 전 '2025-11-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setCurrentDate(new Date('2025-10-01'));
  });

  act(() => {
    result.current.setView('month');
  });

  act(() => {
    result.current.navigate('next');
  });

  expect(formatDate(result.current.currentDate)).toBe('2025-11-01');
});

it("월간 뷰에서 이전으로 navigate시 한 달 전 '2025-09-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setCurrentDate(new Date('2025-10-01'));
  });

  act(() => {
    result.current.setView('month');
  });

  act(() => {
    result.current.navigate('prev');
  });

  expect(formatDate(result.current.currentDate)).toBe('2025-09-01');
});

it("currentDate가 '2025-01-01' 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다", async () => {
  const { result } = renderHook(() => useCalendarView());

  const TEST_DATE = '2025-01-01';

  act(() => {
    result.current.setCurrentDate(new Date(TEST_DATE));
  });

  expect(result.current.holidays[TEST_DATE]).toBe('신정');
});
