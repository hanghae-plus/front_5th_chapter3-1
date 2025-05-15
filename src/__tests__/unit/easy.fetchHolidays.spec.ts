import { describe, it, expect } from 'vitest';

import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    // 2025년 3월: 삼일절(2025-03-01)
    const result = fetchHolidays(new Date('2025-03-15'));
    expect(result).toEqual({
      '2025-03-01': '삼일절',
    });
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    // 2025년 4월: 공휴일 없음
    const result = fetchHolidays(new Date('2025-04-10'));
    expect(result).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    // 2025년 1월: 신정, 설날(3일)
    const result = fetchHolidays(new Date('2025-01-01'));
    expect(result).toEqual({
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    });
  });

  it('10월의 모든 공휴일을 반환한다', () => {
    // 2025년 10월: 개천절, 추석(3일), 한글날
    const result = fetchHolidays(new Date('2025-10-01'));
    expect(result).toEqual({
      '2025-10-03': '개천절',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-09': '한글날',
    });
  });

  it('12월의 크리스마스만 반환한다', () => {
    const result = fetchHolidays(new Date('2025-12-25'));
    expect(result).toEqual({
      '2025-12-25': '크리스마스',
    });
  });
});
