import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const date = new Date('2025-05');
    const result = fetchHolidays(date);

    expect(Object.keys(result)).toHaveLength(1);
    expect(result).toHaveProperty('2025-05-05', '어린이날');
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const date = new Date('2025-02');
    const result = fetchHolidays(date);

    expect(Object.keys(result)).toHaveLength(0);
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const date = new Date('2025-10');
    const result = fetchHolidays(date);

    // 1. 반환된 객체의 키 개수는 5개여야 함
    expect(Object.keys(result)).toHaveLength(5);

    // 2. 각 날짜와 이름이 정확히 포함되어야 함
    expect(result).toMatchObject({
      '2025-10-03': '개천절',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-09': '한글날',
    });
  });
});
