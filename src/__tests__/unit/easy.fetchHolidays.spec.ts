import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    expect(fetchHolidays(new Date('2025-01-01'))).toEqual({
      '2025-01-01': '신정',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-01-31': '설날',
    });
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    expect(fetchHolidays(new Date('2025-07'))).toEqual({});
  });

  // 해당 케이스는 '주어진 월의 공휴일만 반환한다'와 겹친다고 생각해서 주석 처리 했습니다
  // it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {});
});
