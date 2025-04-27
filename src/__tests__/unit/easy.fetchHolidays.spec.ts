import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const testDate = new Date('2025-05-04');
    const holidays = fetchHolidays(testDate);
    expect(Object.keys(holidays)).toHaveLength(1);
    expect(holidays['2025-05-05']).toBe('어린이날');
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const testDate = new Date('2025-04-01');
    const holidays = fetchHolidays(testDate);
    expect(Object.keys(holidays)).toHaveLength(0);
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const testDate = new Date('2025-10-01');
    const holidays = fetchHolidays(testDate);
    const sortedDates = Object.keys(holidays).sort();
    expect(sortedDates).toHaveLength(5);
    expect(sortedDates).toEqual([
      '2025-10-03',
      '2025-10-05',
      '2025-10-06',
      '2025-10-07',
      '2025-10-09',
    ]);
    expect(holidays['2025-10-03']).toBe('개천절');
    expect(holidays['2025-10-05']).toBe('추석');
    expect(holidays['2025-10-06']).toBe('추석');
    expect(holidays['2025-10-07']).toBe('추석');
    expect(holidays['2025-10-09']).toBe('한글날');
  });
});
