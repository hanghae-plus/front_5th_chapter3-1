import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

describe('오늘 날짜를 2025년 10월 1일로 가정하고 테스트 진행', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime('2025-10-01');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    expect(result.current.view).toBe('month');
  });

  it('currentDate는 오늘 날짜인 "2025-10-01"이어야 한다', () => {});

  it('holidays는 10월 휴일인 개천절, 한글날이 지정되어 있어야 한다', () => {});
});

it("view를 'week'으로 변경 시 적절하게 반영된다", () => {});

it("주간 뷰에서 다음으로 navigate시 7일 후 '2025-10-08' 날짜로 지정이 된다", () => {});

it("주간 뷰에서 이전으로 navigate시 7일 후 '2025-09-24' 날짜로 지정이 된다", () => {});

it("월간 뷰에서 다음으로 navigate시 한 달 전 '2025-11-01' 날짜여야 한다", () => {});

it("월간 뷰에서 이전으로 navigate시 한 달 전 '2025-09-01' 날짜여야 한다", () => {});

it("currentDate가 '2025-01-01' 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다", async () => {});
