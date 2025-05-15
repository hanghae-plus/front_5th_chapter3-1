import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const holidays = fetchHolidays(new Date('2025-06-01'));

    expect(holidays).toStrictEqual({
      '2025-06-06': '현충일',
    });
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const holidays = fetchHolidays(new Date('2025-07-01'));

    expect(holidays).toStrictEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const holidays = fetchHolidays(new Date('2025-01-01'));

    expect(holidays).toStrictEqual({
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    });
  });
});
