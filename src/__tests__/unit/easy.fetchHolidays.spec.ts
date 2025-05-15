import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const januaryDate = new Date(2025, 0, 15);
    const januaryHolidays = fetchHolidays(januaryDate);
    expect(Object.keys(januaryHolidays).length).toBe(4);
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const aprilDate = new Date(2025, 3, 10);
    const aprilHolidays = fetchHolidays(aprilDate);
    expect(Object.keys(aprilHolidays).length).toBe(0);
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const octoberDate = new Date(2025, 9, 20);
    const octoberHolidays = fetchHolidays(octoberDate);
    expect(Object.keys(octoberHolidays).length).toBe(5);
  });
});
