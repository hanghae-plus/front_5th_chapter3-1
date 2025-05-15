import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    // 2025년 1월 (설날 포함)
    const january = fetchHolidays(new Date('2025-01-15'));
    
    // 결과는 1월 공휴일만 포함해야 함
    expect(Object.keys(january).length).toBe(4);
    expect(january['2025-01-01']).toBe('신정');
    expect(january['2025-01-29']).toBe('설날');
    expect(january['2025-01-30']).toBe('설날');
    expect(january['2025-01-31']).toBe('설날');
    
    // 다른 달의 공휴일은 포함되지 않아야 함
    expect(january['2025-03-01']).toBeUndefined();
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    // 2025년 4월 (공휴일 없음)
    const april = fetchHolidays(new Date('2025-04-15'));
    
    // 결과는 빈 객체여야 함
    expect(Object.keys(april).length).toBe(0);
    expect(april).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    // 2025년 10월 (추석, 개천절, 한글날 포함)
    const october = fetchHolidays(new Date('2025-10-15'));
    
    // 결과는 10월 공휴일만 포함해야 함
    expect(Object.keys(october).length).toBe(5);
    expect(october['2025-10-03']).toBe('개천절');
    expect(october['2025-10-05']).toBe('추석');
    expect(october['2025-10-06']).toBe('추석');
    expect(october['2025-10-07']).toBe('추석');
    expect(october['2025-10-09']).toBe('한글날');
    
    // 다른 달의 공휴일은 포함되지 않아야 함
    expect(october['2025-12-25']).toBeUndefined();
  });
});
