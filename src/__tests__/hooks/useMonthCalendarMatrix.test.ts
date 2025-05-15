import { renderHook } from '@testing-library/react';

import { useMonthCalendarMatrix } from '../../features/event-viewer/model/useMonthCalendarMatrix';

describe('useMonthCalendarMatrix', () => {
  const baseDate = new Date('2025-07-01');
  const holidays = {
    '2025-07-17': '제헌절',
    '2025-07-01': '달의 첫날',
  };

  it('2025년 7월에 대해 올바른 주차와 날짜 문자열을 반환해야 한다', () => {
    const { result } = renderHook(() => useMonthCalendarMatrix(baseDate, holidays));

    const matrix = result.current;

    // 5주가 있어야 함 (7월 1일은 화요일, 31일은 목요일)
    expect(matrix.length).toBe(5);

    // 1주차에 1일이 포함되어 있어야 함
    const firstWeek = matrix[0];
    const firstDay = firstWeek.find((cell) => cell?.day === 1);
    expect(firstDay?.dateString).toBe('2025-07-01');
    expect(firstDay?.holiday).toBe('달의 첫날');

    // 3주차에 17일(제헌절)이 있어야 함
    const thirdWeek = matrix[2];
    const seventeenth = thirdWeek.find((cell) => cell?.day === 17);
    expect(seventeenth?.dateString).toBe('2025-07-17');
    expect(seventeenth?.holiday).toBe('제헌절');
  });

  it('day가 null인 경우는 dateString과 holiday도 null이어야 한다', () => {
    const { result } = renderHook(() => useMonthCalendarMatrix(new Date('2025-08-01'), {}));

    const matrix = result.current;
    const nullCells = matrix.flat().filter((cell) => cell.day === null);
    expect(nullCells.every((cell) => cell.dateString === null)).toBe(true);
    expect(nullCells.every((cell) => cell.holiday === null)).toBe(true);
  });
});
