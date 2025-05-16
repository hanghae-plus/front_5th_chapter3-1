import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('2025년 10월에 해당하는 모든 공휴일을 반환해야 한다', () => {
    const result = fetchHolidays(new Date('2025-10-01'));

    expect(result).toEqual({
      '2025-10-03': '개천절',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-09': '한글날',
    });
  });

  it('2025년 2월처럼 공휴일이 없는 경우 빈 객체를 반환해야 한다', () => {
    const result = fetchHolidays(new Date('2025-02-01'));
    expect(result).toEqual({});
  });

  it('2025년 1월처럼 공휴일이 여러 개인 경우 모두 반환되어야 한다', () => {
    const result = fetchHolidays(new Date('2025-01-01'));

    expect(result).toEqual({
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    });
  });
});
