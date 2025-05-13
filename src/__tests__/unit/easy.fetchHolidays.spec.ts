import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    // 2025년 10월에 대한 공휴일 조회
    const octoberDate = new Date('2025-10-15');
    const octoberHolidays = fetchHolidays(octoberDate);

    // 10월에는 개천절(3일), 추석(5-7일), 한글날(9일)이 있음
    expect(Object.keys(octoberHolidays)).toHaveLength(5);
    expect(octoberHolidays['2025-10-03']).toBe('개천절');
    expect(octoberHolidays['2025-10-05']).toBe('추석');
    expect(octoberHolidays['2025-10-06']).toBe('추석');
    expect(octoberHolidays['2025-10-07']).toBe('추석');
    expect(octoberHolidays['2025-10-09']).toBe('한글날');

    // 다른 월의 공휴일은 포함되지 않아야 함
    expect(octoberHolidays['2025-01-01']).toBeUndefined();
    expect(octoberHolidays['2025-05-05']).toBeUndefined();
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    // 2025년 4월에는 공휴일이 없음
    const aprilDate = new Date('2025-04-15');
    const aprilHolidays = fetchHolidays(aprilDate);

    expect(Object.keys(aprilHolidays)).toHaveLength(0);
    expect(aprilHolidays).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    // 2025년 1월에는 신정과 설날이 있음
    const januaryDate = new Date('2025-01-15');
    const januaryHolidays = fetchHolidays(januaryDate);

    expect(Object.keys(januaryHolidays)).toHaveLength(4);
    expect(januaryHolidays['2025-01-01']).toBe('신정');
    expect(januaryHolidays['2025-01-29']).toBe('설날');
    expect(januaryHolidays['2025-01-30']).toBe('설날');
    expect(januaryHolidays['2025-01-31']).toBe('설날');
  });
});
