import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  // 하드 코딩해도 되나 ?
  it('주어진 월의 공휴일만 반환한다', () => {
    const result = fetchHolidays(new Date('2025-08-01'));

    const expected = {
      '2025-08-15': '광복절',
    };

    expect(result).toEqual(expected);
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const result = fetchHolidays(new Date('2025-07-01'));

    expect(result).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const result = fetchHolidays(new Date('2025-10-01'));

    const expected = {
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-03': '개천절',
      '2025-10-09': '한글날',
    };

    expect(result).toEqual(expected);
  });
});
