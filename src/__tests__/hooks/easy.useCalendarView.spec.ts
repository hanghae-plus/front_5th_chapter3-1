import { act, renderHook, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';

import { handlers } from '../../__mocks__/handlers.ts';
import { useCalendarView } from '../../shared/hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

/* msw */
export const server = setupServer(...handlers);

// ✅ 모든 테스트 전 가짜 타이머 + 고정 시간 설정
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-01')); // 시스템 시간 고정
});

// ✅ 모든 테스트 후 타이머 복원
afterEach(() => {
  vi.useRealTimers();
  server.resetHandlers();
});

describe('초기 상태', () => {
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    const { current } = result;
    expect(current.view).toBe('month');
  });

  it('currentDate는 오늘 날짜인 "2025-10-01"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    const { current } = result;
    expect(current.currentDate.toISOString().slice(0, 10)).toBe('2025-10-01');
  });

  it('holidays는 10월 휴일인 개천절, 한글날이 지정되어 있어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    const { current } = result;
    expect(current.holidays).toMatchObject({
      '2025-10-03': '개천절',
      '2025-10-09': '한글날',
    });
  });
});

// view를 'week'으로 변경 시 적절하게 반영된다
it("view를 'week'으로 변경 시 view값이 week로 반영된다.", () => {
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.setView('week');
  });

  expect(result.current.view).toBe('week');
});

it("주간 뷰에서 다음으로 navigate시 7일 후 '2025-10-08' 날짜로 지정이 된다", () => {
  const { result } = renderHook(() => useCalendarView());
  // 먼저 view 변경
  act(() => {
    result.current.setView('week');
  });

  // 상태 업데이트 이후 navigate 실행
  act(() => {
    result.current.navigate('next');
  });

  // 날짜 비교는 assertDate 유틸 사용해서 명확하게
  assertDate(result.current.currentDate, new Date('2025-10-08'));
});

it("주간 뷰에서 이전으로 navigate시 7일 전 '2025-09-24' 날짜로 지정이 된다", () => {
  const { result } = renderHook(() => useCalendarView());
  // 먼저 view 변경
  act(() => {
    result.current.setView('week');
  });

  // 상태 업데이트 이후 navigate 실행
  act(() => {
    result.current.navigate('prev');
  });

  // 날짜 비교는 assertDate 유틸 사용해서 명확하게
  assertDate(result.current.currentDate, new Date('2025-09-24'));
});

it("월간 뷰에서 다음으로 navigate시 한 달 전 '2025-11-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());
  // 먼저 view 변경
  act(() => {
    result.current.setView('month');
  });

  // 상태 업데이트 이후 navigate 실행
  act(() => {
    result.current.navigate('next');
  });

  assertDate(result.current.currentDate, new Date('2025-11-01'));
});

it("월간 뷰에서 이전으로 navigate시 한 달 전 '2025-09-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());
  // 먼저 view 변경
  act(() => {
    result.current.setView('month');
  });

  // 상태 업데이트 이후 navigate 실행
  act(() => {
    result.current.navigate('prev');
  });

  assertDate(result.current.currentDate, new Date('2025-09-01'));
});

it("currentDate가 '2025-01-01' 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다", async () => {
  // 타이머 실행 (비동기 setState 처리 강제)
  vi.useRealTimers();
  const { result } = renderHook(() => useCalendarView());

  // 날짜를 2025-01-01로 변경
  act(() => {
    result.current.setCurrentDate(new Date('2025-01-01'));
  });

  // holidays 값이 반영될 때까지 기다림
  await waitFor(() => {
    expect(result.current.holidays).toHaveProperty('2025-01-01', '신정');
  });

  assertDate(result.current.currentDate, new Date('2025-01-01'));
});
