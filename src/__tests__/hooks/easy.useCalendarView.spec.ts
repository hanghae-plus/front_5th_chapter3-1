import { act, renderHook, waitFor } from '@testing-library/react';

import * as api from '../../apis/fetchHolidays';
import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

// 총 9개

vi.mock('../../apis/fetchHolidays', () => ({
  fetchHolidays: vi.fn((date: Date) => {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    if (year === 2025 && month === 10) {
      return {
        '2025-10-03': '개천절',
        '2025-10-09': '한글날',
      };
    }
    if (year === 2025 && month === 1) {
      return {
        '2025-01-01': '신정',
      };
    }
    return {};
  }),
}));

const mockFetchHolidays = vi.mocked(api.fetchHolidays);

describe('useCalendarView Hook Test', () => {
  const initialDate = new Date('2025-10-01');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(initialDate);
    mockFetchHolidays.mockClear();
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
      assertDate(result.current.currentDate, initialDate);
    });

    it('holidays는 10월 휴일인 개천절, 한글날이 지정되어 있어야 한다', () => {
      const { result } = renderHook(() => useCalendarView());
      expect(mockFetchHolidays).toHaveBeenCalledWith(initialDate);
      expect(result.current.holidays).toEqual({
        '2025-10-03': '개천절',
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

  it("currentDate가 '2025-01-01' 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useCalendarView());
    const newDate = new Date('2025-01-01T00:00:00.000Z'); // UTC 자정으로 명시

    expect(result.current.holidays).toEqual({
      '2025-10-03': '개천절',
      '2025-10-09': '한글날',
    });

    mockFetchHolidays.mockClear();

    act(() => {
      result.current.setCurrentDate(newDate);
    });

    waitFor(() => {
      expect(mockFetchHolidays).toHaveBeenCalledWith(
        expect.any(Date) && expect.objectContaining({ getTime: newDate.getTime() })
      );
    });

    expect(result.current.holidays).toEqual({
      '2025-01-01': '신정',
    });

    assertDate(result.current.currentDate, newDate);
  });
});
