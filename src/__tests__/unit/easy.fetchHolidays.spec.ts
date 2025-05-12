import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const check = fetchHolidays(new Date('2025-01-01'));
    expect(check).toEqual({
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    });

    const check2 = fetchHolidays(new Date('2025-02-02'));
    expect(check2).toEqual({});

    const check3 = fetchHolidays(new Date('2025-03-03'));
    expect(check3).toEqual({
      '2025-03-01': '삼일절',
    });

    const check4 = fetchHolidays(new Date('2025-04-04'));
    expect(check4).toEqual({});

    const check5 = fetchHolidays(new Date('2025-05-05'));
    expect(check5).toEqual({
      '2025-05-05': '어린이날',
    });

    const check6 = fetchHolidays(new Date('2025-06-06'));
    expect(check6).toEqual({
      '2025-06-06': '현충일',
    });

    const check7 = fetchHolidays(new Date('2025-07-07'));
    expect(check7).toEqual({});

    const check8 = fetchHolidays(new Date('2025-08-08'));
    expect(check8).toEqual({
      '2025-08-15': '광복절',
    });

    const check9 = fetchHolidays(new Date('2025-09-09'));
    expect(check9).toEqual({});
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const check = fetchHolidays(new Date('2025-09-09'));
    expect(check).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const check = fetchHolidays(new Date('2025-01-01'));
    expect(check).toEqual({
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    });
  });
});
