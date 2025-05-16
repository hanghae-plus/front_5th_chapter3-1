import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

describe('초기 상태', () => {
  const { result } = renderHook(() => useCalendarView());
  const updateDate = result.current.setCurrentDate;
  act(() => {
    updateDate(new Date('2025-10-01'));
  });
  it('view는 "month"이어야 한다', async () => {
    expect(result.current.view).toBe('month');
  });

  it('currentDate는 오늘 날짜인 "2025-10-01"이어야 한다', () => {
    assertDate(result.current.currentDate, new Date('2025-10-01'));
  });

  it('holidays는 10월 휴일인 개천절, 한글날이 지정되어 있어야 한다', () => {
    const updateDate = result.current.setCurrentDate;
    act(() => {
      updateDate(new Date('2025-10-01'));
    });

    const holidays = result.current.holidays;
    const OctoberHolidays = {
      '2025-10-03': '개천절',
      '2025-10-09': '한글날',
    };

    expect(holidays).toMatchObject(OctoberHolidays);
  });
});

it("view를 'week'으로 변경 시 적절하게 반영된다", async () => {
  const { result } = renderHook(() => useCalendarView());

  await act(async () => {
    result.current.setView('week');
  });
  expect(result.current.view).toBe('week');
});

it("주간 뷰에서 다음으로 navigate시 7일 후 '2025-10-08' 날짜로 지정이 된다", () => {
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.setCurrentDate(new Date('2025-10-01'));
  });
  // 0512 이슈
  // week로 갱신되지 않은 체 navigate가 호출되어서 month를 기준으로 변경됨.
  // 비동기 문제인가 싶어 waitFor를 사용했지만 해결되지 않음.
  // 구조분해로 result.current에서 setView와 navigate를 사용하면 함수가 초기상태로 고정된 함수들로 재호출하기때문에 이슈 발생
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
    result.current.setCurrentDate(new Date('2025-10-01'));
  });
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
    result.current.setCurrentDate(new Date('2025-10-01'));
  });
  act(() => {
    result.current.setView('month');
  });

  act(() => {
    result.current.navigate('next');
  });

  assertDate(result.current.currentDate, new Date('2025-11-01'));
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

  assertDate(result.current.currentDate, new Date('2025-09-01'));
});

it("currentDate가 '2025-01-01' 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다", async () => {
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.setCurrentDate(new Date('2025-10-01'));
  });
  act(() => {
    result.current.setCurrentDate(new Date('2025-01-01'));
  });

  const holidays = result.current.holidays;
  const JanuaryHolidays = {
    '2025-01-01': '신정',
  };

  expect(holidays).toMatchObject(JanuaryHolidays);
});
