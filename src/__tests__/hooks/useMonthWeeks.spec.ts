// src/__tests__/hooks/useMonthWeeks.spec.ts
import { renderHook } from '@testing-library/react';

import { useMonthWeeks } from '@/shared/hooks/useMonthWeeks';
import * as dateUtils from '@/shared/lib/dateUtils';

describe('useMonthWeeks 훅', () => {
  const mockDate = new Date('2025-07-01');

  it('getWeeksAtMonth를 호출하여 결과를 반환한다', () => {
    const mockReturn = [
      [null, 1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12, 13],
    ];

    // getWeeksAtMonth를 mock 처리
    const spy = vi.spyOn(dateUtils, 'getWeeksAtMonth').mockReturnValue(mockReturn);

    const { result } = renderHook(() => useMonthWeeks(mockDate));

    expect(spy).toHaveBeenCalledWith(mockDate);
    expect(result.current).toEqual(mockReturn);

    spy.mockRestore();
  });

  it('같은 currentDate로 재호출 시 캐싱된 결과를 반환한다', () => {
    const spy = vi.spyOn(dateUtils, 'getWeeksAtMonth');

    const { rerender } = renderHook(({ date }) => useMonthWeeks(date), {
      initialProps: { date: mockDate },
    });

    rerender({ date: mockDate }); // 같은 날짜로 재호출

    expect(spy).toHaveBeenCalledTimes(1); // useMemo 덕분에 다시 호출되지 않아야 함

    spy.mockRestore();
  });
});
