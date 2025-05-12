import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const result1 = fetchHolidays(new Date('2025-01-01'));
    expect(result1).toEqual({
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    });

    const result2 = fetchHolidays(new Date('2025-02-01'));
    expect(result2).toEqual({});

    const result3 = fetchHolidays(new Date('2025-03-01'));
    expect(result3).toEqual({
      '2025-03-01': '삼일절',
    });

    const result4 = fetchHolidays(new Date('2025-04-01'));
    expect(result4).toEqual({});

    const result5 = fetchHolidays(new Date('2025-05-01'));
    expect(result5).toEqual({
      '2025-05-05': '어린이날',
    });

    const result6 = fetchHolidays(new Date('2025-06-01'));
    expect(result6).toEqual({
      '2025-06-06': '현충일',
    });

    const result7 = fetchHolidays(new Date('2025-07-01'));
    expect(result7).toEqual({});

    const result8 = fetchHolidays(new Date('2025-08-01'));
    expect(result8).toEqual({
      '2025-08-15': '광복절',
    });

    const result9 = fetchHolidays(new Date('2025-09-01'));
    expect(result9).toEqual({});

    const result10 = fetchHolidays(new Date('2025-10-01'));
    expect(result10).toEqual({
      '2025-10-03': '개천절',
      '2025-10-09': '한글날',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
    });

    const result11 = fetchHolidays(new Date('2025-11-01'));
    expect(result11).toEqual({});

    const result12 = fetchHolidays(new Date('2025-12-01'));
    expect(result12).toEqual({
      '2025-12-25': '크리스마스',
    });
  });
  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const result = fetchHolidays(new Date('2025-02-01'));
    expect(result).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const result10 = fetchHolidays(new Date('2025-10-01'));
    expect(result10).toEqual({
      '2025-10-03': '개천절',
      '2025-10-09': '한글날',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
    });
  });
});
