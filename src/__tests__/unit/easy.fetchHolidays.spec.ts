import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const januaryDate = new Date('2025-01-15');
    const januaryHolidays = fetchHolidays(januaryDate);

    expect(januaryHolidays).toEqual({
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    });

    const mayDate = new Date('2025-05-15');
    const mayHolidays = fetchHolidays(mayDate);

    expect(mayHolidays).toEqual({
      '2025-05-05': '어린이날',
    });
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const februaryDate = new Date('2025-02-15');
    const februaryHolidays = fetchHolidays(februaryDate);

    expect(februaryHolidays).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const octoberDate = new Date('2025-10-15');
    const octoberHolidays = fetchHolidays(octoberDate);

    expect(Object.keys(octoberHolidays)).toHaveLength(5);

    expect(octoberHolidays).toEqual({
      '2025-10-03': '개천절',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-09': '한글날',
    });
  });

  it('연도가 다른 월의 공휴일은 반환하지 않는다', () => {
    const january2025 = new Date('2025-01-15');
    const holidays2025 = fetchHolidays(january2025);

    const january2024 = new Date('2024-01-15');
    const holidays2024 = fetchHolidays(january2024);

    expect(holidays2024).toEqual({});

    expect(holidays2024).not.toEqual(holidays2025);
  });

  it('입력 날짜의 일은 무시하고 월만 필터한다', () => {
    const date1 = new Date('2025-01-01');
    const date2 = new Date('2025-01-15');
    const date3 = new Date('2025-01-31');

    const holidays1 = fetchHolidays(date1);
    const holidays2 = fetchHolidays(date2);
    const holidays3 = fetchHolidays(date3);

    expect(Object.keys(holidays1)).toHaveLength(4);

    expect(holidays1).toEqual(holidays2);
    expect(holidays2).toEqual(holidays3);
  });

  it('입력 날짜가 잘못된 형식일 경우 빈 객체를 반환한다', () => {
    const invalidDate = new Date('invalid');
    const holidays = fetchHolidays(invalidDate);

    expect(holidays).toEqual({});
  });
});
