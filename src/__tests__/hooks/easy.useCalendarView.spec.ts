import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

describe('초기 상태', () => {
  let mockDate: Date;
  beforeEach(() => {
    vi.useFakeTimers();
    mockDate = new Date('2025-10-01');
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.view).toBe('month');
  });

  it('currentDate는 오늘 날짜인 "2025-10-01"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    const dataDate = result.current.currentDate;

    assertDate(dataDate, mockDate);
  });

  it('holidays는 10월 휴일인 개천절, 한글날이 지정되어 있어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    const holidays = result.current.holidays;

    // 포함 확인
    expect(Object.values(holidays).includes('개천절')).toBe(true);
    expect(Object.values(holidays).includes('한글날')).toBe(true);
  });
});

describe('view 변경', () => {
  it("view를 'week'으로 변경 시 적절하게 반영된다", () => {
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.view).toBe('month');
    act(() => {
      result.current.setView('week');
    });
    expect(result.current.view).toBe('week');
    // 테이블 등이 잘 나오는지 확인을 더해보면 좋을 것 같다.
  });

  it('view를 빠르게 변경해도 적절하게 반영된다', () => {
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.view).toBe('month');
    act(() => {
      result.current.setView('week');
      result.current.setView('month');
    });
    expect(result.current.view).toBe('month');
    act(() => {
      result.current.setView('week');
    });
    expect(result.current.view).toBe('week');
  });
});

describe('날짜 이동', () => {
  let mockDate: Date;
  beforeEach(() => {
    vi.useFakeTimers();
    mockDate = new Date('2025-10-01');
    vi.setSystemTime(mockDate);
  });

  it("주간 뷰에서 다음으로 navigate시 7일 후 '2025-10-08' 날짜로 지정이 된다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setView('week');
    });
    act(() => {
      result.current.navigate('next');
    });

    // 날짜 비교
    const dataDate = result.current.currentDate;
    assertDate(dataDate, new Date('2025-10-08'));
  });

  it("주간 뷰에서 이전으로 navigate시 7일 후 '2025-09-24' 날짜로 지정이 된다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setView('week');
    });
    act(() => {
      result.current.navigate('prev');
    });

    // 날짜 비교
    const dataDate = result.current.currentDate;
    assertDate(dataDate, new Date('2025-09-24'));
  });

  it("월간 뷰에서 다음으로 navigate시 한 달 전 '2025-11-01' 날짜여야 한다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setView('month');
    });
    act(() => {
      result.current.navigate('next');
    });

    // 날짜 비교
    const dataDate = result.current.currentDate;
    assertDate(dataDate, new Date('2025-11-01'));
  });

  it("월간 뷰에서 이전으로 navigate시 한 달 전 '2025-09-01' 날짜여야 한다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setView('month');
    });
    act(() => {
      result.current.navigate('prev');
    });

    // 날짜 비교
    const dataDate = result.current.currentDate;
    assertDate(dataDate, new Date('2025-09-01'));
  });

  it("currentDate가 '2025-01-01' 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다", async () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setCurrentDate(new Date('2025-01-01'));
    });
    const holidays = result.current.holidays;
    expect(Object.values(holidays).includes('신정')).toBe(true);
  });
});
