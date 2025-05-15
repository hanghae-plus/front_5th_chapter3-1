import { fetchHolidays } from '../../entities/holiday/api/fetchHolidays';

describe('fetchHolidays', () => {
  it("2025년 8월 1일을 입력하면 { '2025-08-15': '광복절' }을 반환한다", () => {
    const result = fetchHolidays(new Date('2025-08-01'));

    const expected = {
      '2025-08-15': '광복절',
    };

    expect(result).toEqual(expected);
  });

  it('2025년 7월 1일(공휴일 없는 달)을 입력하면 빈 객체를 반환한다', () => {
    const result = fetchHolidays(new Date('2025-07-01'));

    expect(result).toEqual({});
  });

  it("2025년 10월 1일을 입력하면 { '2025-10-05': '추석', '2025-10-06': '추석', '2025-10-07': '추석', '2025-10-03': '개천절', '2025-10-09': '한글날' }을 반환한다", () => {
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
