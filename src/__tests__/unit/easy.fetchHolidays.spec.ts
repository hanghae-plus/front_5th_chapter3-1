import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    // 3월 테스트 (삼일절만 있는 월)
    const marchDate = new Date('2025-03-15');
    const marchHolidays = fetchHolidays(marchDate);

    expect(marchHolidays).toEqual({
      '2025-03-01': '삼일절',
    });
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const aprilDate = new Date('2025-04-15');
    const aprilHolidays = fetchHolidays(aprilDate);

    expect(aprilHolidays).toEqual({});
    expect(Object.keys(aprilHolidays)).toHaveLength(0);
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {    // 10월 테스트 (추석, 개천절, 한글날이 있는 월)
    const octoberDate = new Date('2025-10-15');
    const octoberHolidays = fetchHolidays(octoberDate);

    expect(octoberHolidays).toEqual({
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-03': '개천절',
      '2025-10-09': '한글날',
    });

    // 모든 공휴일이 포함되어 있는지 확인
    expect(Object.keys(octoberHolidays)).toHaveLength(5);
  });

  it('연초 설날 연휴가 정확히 반환된다', () => {
    const januaryDate = new Date('2025-01-15');
    const januaryHolidays = fetchHolidays(januaryDate);

    expect(januaryHolidays).toEqual({
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    });
  });
});
