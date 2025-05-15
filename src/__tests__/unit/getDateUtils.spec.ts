import { getDaysInMonth, formatMonth, formatDate } from '@/shared/lib/dateUtils';

describe('getDaysInMonth', () => {
  it('윤년인 2024년 2월은 29일이어야 한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('일반년도인 2023년 2월은 28일이어야 한다', () => {
    expect(getDaysInMonth(2023, 2)).toBe(28);
  });

  it('13월은 잘못된 값이므로 0을 반환해야 한다', () => {
    expect(getDaysInMonth(2023, 13)).toBe(0);
  });
});

describe('formatMonth', () => {
  it('2025년 5월 날짜를 "2025년 5월" 형식으로 반환해야 한다', () => {
    const date = new Date('2025-05-15');
    expect(formatMonth(date)).toBe('2025년 5월');
  });
});

describe('formatDate', () => {
  it('day가 주어지면 해당 일자를 포함한 날짜 문자열을 반환해야 한다', () => {
    const baseDate = new Date('2025-05-01');
    expect(formatDate(baseDate, 9)).toBe('2025-05-09');
  });

  it('day가 생략되면 현재 날짜를 기준으로 반환해야 한다', () => {
    const baseDate = new Date('2025-05-01');
    expect(formatDate(baseDate)).toBe('2025-05-01');
  });
});
