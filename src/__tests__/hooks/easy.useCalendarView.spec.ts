import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import * as holidaysModule from '../../apis/fetchHolidays.ts';
import { useCalendarView } from '../../hooks/useCalendarView.ts';
// import { assertDate } from '../utils.ts';

// 파일 최상단에 모든 테스트에 공통되는 모킹 설정
let mockDate: Date;
beforeEach(() => {
  // 모든 테스트에서 사용할 날짜 모킹
  vi.useFakeTimers();
  mockDate = new Date('2025-10-01');
  vi.setSystemTime(mockDate);

  // 모든 테스트에서 사용할 휴일 데이터 모킹
  vi.spyOn(holidaysModule, 'fetchHolidays').mockReturnValue({
    '2025-10-03': '개천절',
    '2025-10-09': '한글날',
  });
});

// 모든 테스트 후 타이머 정리
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('초기 상태', () => {
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.view).toBe('month');
  });

  it('currentDate는 오늘 날짜인 "2025-10-01"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    // assertDate(result.current.currentDate, new Date('2025-10-01'));
    expect(result.current.currentDate).toEqual(new Date('2025-10-01'));
  });

  it('holidays는 10월 휴일인 개천절, 한글날이 지정되어 있어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.holidays).toEqual({
      '2025-10-03': '개천절',
      '2025-10-09': '한글날',
    });
  });
});

describe('뷰 변경 및 내비게이션', () => {
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
    expect(result.current.currentDate).toEqual(new Date('2025-10-08'));
  });

  it("주간 뷰에서 이전으로 navigate시 7일 후 '2025-09-24' 날짜로 지정이 된다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setView('week');
    });
    act(() => {
      result.current.navigate('prev');
    });
    expect(result.current.currentDate).toEqual(new Date('2025-09-24'));
  });

  it("월간 뷰에서 다음으로 navigate시 한 달 전 '2025-11-01' 날짜여야 한다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setView('month');
    });
    act(() => {
      result.current.navigate('next');
    });
    expect(result.current.currentDate).toEqual(new Date('2025-11-01'));
  });

  it("월간 뷰에서 이전으로 navigate시 한 달 전 '2025-09-01' 날짜여야 한다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setView('month');
    });
    act(() => {
      result.current.navigate('prev');
    });
    expect(result.current.currentDate).toEqual(new Date('2025-09-01'));
  });
});

describe('날짜 변경과 휴일 업데이트', () => {
  it("currentDate가 '2025-01-01' 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다", async () => {
    // 기존 모킹을 복원하고 이 테스트에서만 사용할 새로운 모킹 설정
    vi.restoreAllMocks(); // 기존 모킹 삭제

    // 1월 휴일 데이터만 반환하도록 새로 모킹 설정
    vi.spyOn(holidaysModule, 'fetchHolidays').mockReturnValue({
      '2025-01-01': '신정',
    });

    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.currentDate = new Date('2025-01-01');
    });
    expect(result.current.holidays).toEqual({
      '2025-01-01': '신정',
    });
  });
});
