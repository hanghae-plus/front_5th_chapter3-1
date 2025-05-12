import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    // 10월 날짜로 테스트
    const octoberDate = new Date('2025-10-15');
    const octoberHolidays = fetchHolidays(octoberDate);
    console.log(octoberHolidays);

    // 결과에 10월 공휴일만 포함되어 있는지 확인
    expect(Object.keys(octoberHolidays).length).toBeGreaterThan(0); // 최소 하나 이상의 결과

    // 모든 키가 '2025-10'으로 시작하는지 확인 (즉, 10월 날짜인지)
    Object.keys(octoberHolidays).forEach((date) => {
      expect(date.startsWith('2025-10')).toBe(true);
    });

    // 구체적인 10월 공휴일이 포함되어 있는지 확인
    expect(octoberHolidays['2025-10-03']).toBe('개천절');
    expect(octoberHolidays['2025-10-09']).toBe('한글날');
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    // 공휴일이 없는 월(예: 2025년 4월)로 테스트
    const aprilDate = new Date('2025-04-15');
    const aprilHolidays = fetchHolidays(aprilDate);

    // 결과가 빈 객체인지 확인
    expect(Object.keys(aprilHolidays).length).toBe(0);
    expect(aprilHolidays).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    // 여러 공휴일이 있는 월(예: 2025년 10월)로 테스트
    const octoberDate = new Date('2025-10-15');
    const octoberHolidays = fetchHolidays(octoberDate);

    // 모든 10월 공휴일이 포함되어 있는지 확인
    const expectedHolidays: Record<string, string> = {
      '2025-10-03': '개천절',
      '2025-10-09': '한글날',
      // 추석도 10월에 있다면 추가
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
    };

    // 예상되는 모든 공휴일이 포함되어 있는지 확인
    Object.keys(expectedHolidays).forEach((date) => {
      expect((octoberHolidays as any)[date]).toBe(expectedHolidays[date]);
    });

    // 전체 공휴일 수가 일치하는지 확인
    expect(Object.keys(octoberHolidays).length).toBe(Object.keys(expectedHolidays).length);
  });
});
