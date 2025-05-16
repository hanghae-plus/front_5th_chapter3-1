import { fetchHolidays } from '../../apis/fetchHolidays';

// 총 3개

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const date = new Date('2025-01');
    const expectedHolidays = {
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    };
    expect(fetchHolidays(date)).toEqual(expectedHolidays);
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const dateApr = new Date('2025-04');
    expect(fetchHolidays(dateApr)).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const date = new Date('2025-10');
    const expectedHolidays = {
      '2025-10-03': '개천절',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-09': '한글날',
    };
    expect(fetchHolidays(date)).toEqual(expectedHolidays);
  });
});
