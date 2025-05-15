import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const date = new Date('2025-01-15');
    const holidays = fetchHolidays(date);

    expect(Object.keys(holidays).length).toBe(4);
    expect(holidays['2025-01-01']).toBe('신정');
    expect(holidays['2025-01-29']).toBe('설날');
    expect(holidays['2025-01-30']).toBe('설날');
    expect(holidays['2025-01-31']).toBe('설날');
    expect(holidays['2025-02-01']).toBeUndefined();
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const date = new Date('2025-04-15');
    const holidays = fetchHolidays(date);

    expect(Object.keys(holidays).length).toBe(0);
    expect(holidays).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const date = new Date('2025-10-15');
    const holidays = fetchHolidays(date);

    expect(Object.keys(holidays).length).toBe(5);
    expect(holidays['2025-10-03']).toBe('개천절');
    expect(holidays['2025-10-05']).toBe('추석');
    expect(holidays['2025-10-06']).toBe('추석');
    expect(holidays['2025-10-07']).toBe('추석');
    expect(holidays['2025-10-09']).toBe('한글날');
  });
});
