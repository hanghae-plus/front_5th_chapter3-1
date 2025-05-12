import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

describe('useCalendarView 초기 상태', () => {
  vi.useFakeTimers();
  vi.setSystemTime('2025-10-01');

  it('view는 "month"이어야 한다', () => {
    const { view } = renderHook(() => useCalendarView()).result.current;
    expect(view).toBe('month');
  });

  it('currentDate는 오늘 날짜인 "2025-10-01" 이어야 한다', () => {
    const { currentDate } = renderHook(() => useCalendarView()).result.current;
    assertDate(currentDate, new Date('2025-10-01'));
  });

  it('holidays는 10월 휴일인 추석, 개천절, 한글날이 지정되어 있어야 한다', () => {
    const { holidays } = renderHook(() => useCalendarView()).result.current;
    expect(holidays).toEqual({
      '2025-10-03': '개천절',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-09': '한글날',
    });
  });
});

describe('useCalendarView 내부 동작', () => {
  vi.useFakeTimers();
  vi.setSystemTime('2025-10-01');

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
      result.current.navigate('next');
    });
    expect(result.current.currentDate).toEqual(new Date('2025-11-01'));
  });

  it("월간 뷰에서 이전으로 navigate시 한 달 전 '2025-09-01' 날짜여야 한다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.navigate('prev');
    });
    expect(result.current.currentDate).toEqual(new Date('2025-09-01'));
  });

  // 25년 1월의 경우 '신정' 뿐만 아니라 '설날'이 포함되어 있어, 테스트 설명이 수정되어야 합니다.
  // '신정', '설날' 모두 포함시키기에는 테스트 설명이 복잡해질 것 같아, 5월로 바꿨습니다.
  it("currentDate가 '2025-05-05' 변경되면 5월 휴일 '어린이날'로 업데이트되어야 한다", async () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setCurrentDate(new Date('2025-05-05'));
    });
    expect(result.current.holidays).toEqual({
      '2025-05-05': '어린이날',
    });
  });
});
