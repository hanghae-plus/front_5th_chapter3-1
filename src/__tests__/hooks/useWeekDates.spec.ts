import { renderHook } from '@testing-library/react';

import { useWeekDates } from '@/shared/hooks/useWeekDates';
import { getWeekDates } from '@/shared/lib/dateUtils';

describe('useWeekDates 훅', () => {
  it('지정한 날짜의 주간 날짜 배열을 반환한다', () => {
    const date = new Date('2025-07-03'); // 목요일
    const { result } = renderHook(() => useWeekDates(date));

    const expected = getWeekDates(date);

    expect(result.current).toEqual(expected);
    expect(result.current).toHaveLength(7);
    expect(result.current[0].getDay()).toBe(0); // 일요일
    expect(result.current[6].getDay()).toBe(6); // 토요일
  });

  it('같은 날짜로 여러 번 호출 시 결과 값이 일관된 배열을 반환한다', () => {
    const date = new Date('2025-07-03');
    const { result, rerender } = renderHook(({ currentDate }) => useWeekDates(currentDate), {
      initialProps: { currentDate: date },
    });

    const firstResult = result.current;
    rerender({ currentDate: new Date('2025-07-03') }); // 같은 날짜 값

    // ✅ 참조 동등성 대신 값 비교
    expect(result.current).toStrictEqual(firstResult);
  });
});
