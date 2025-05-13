import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const holidays = fetchHolidays(new Date('2025-03-01'));
    expect(holidays).toEqual({ '2025-03-01': '삼일절' });
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const holidays = fetchHolidays(new Date('2025-09-01'));
    expect(holidays).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const holidays = fetchHolidays(new Date('2025-01-01'));
    expect(Object.keys(holidays)).toHaveLength(4);
  });
});
