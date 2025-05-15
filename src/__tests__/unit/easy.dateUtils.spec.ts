import { Event } from '../../types';
import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '../../utils/dateUtils';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    expect(getDaysInMonth(2025, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2025, 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29); // 2024년은 윤년
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28); // 2025년은 평년
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(2025, 0)).toBe(31); // 0월은 이전 해 12월로 처리됨
    expect(getDaysInMonth(2025, 13)).toBe(31); // 13월은 다음 해 1월로 처리됨
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // 2025-07-09는 수요일
    const date = new Date('2025-07-09');
    const weekDates = getWeekDates(date);
    
    // 주의 시작은 일요일이어야 함
    expect(weekDates[0].getDay()).toBe(0);
    expect(weekDates[0].getDate()).toBe(6);
    
    // 주의 마지막은 토요일이어야 함
    expect(weekDates[6].getDay()).toBe(6);
    expect(weekDates[6].getDate()).toBe(12);
    
    // 주 전체를 확인
    expect(weekDates.length).toBe(7);
    for (let i = 0; i < 7; i++) {
      expect(weekDates[i].getMonth()).toBe(6); // 7월
      expect(weekDates[i].getFullYear()).toBe(2025);
    }
  });

  it('주의 시작(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // 2025-07-06은 일요일
    const date = new Date('2025-07-06');
    const weekDates = getWeekDates(date);
    
    expect(weekDates[0].getDate()).toBe(6);
    expect(weekDates[6].getDate()).toBe(12);
  });

  it('주의 끝(토요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // 2025-07-12는 토요일
    const date = new Date('2025-07-12');
    const weekDates = getWeekDates(date);
    
    expect(weekDates[0].getDate()).toBe(6);
    expect(weekDates[6].getDate()).toBe(12);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    // 2025-12-30은 화요일, 주가 2026년으로 넘어감
    const date = new Date('2025-12-30');
    const weekDates = getWeekDates(date);
    
    // 주의 시작은 일요일 (2025-12-28)
    expect(weekDates[0].getFullYear()).toBe(2025);
    expect(weekDates[0].getMonth()).toBe(11); // 12월
    expect(weekDates[0].getDate()).toBe(28);
    
    // 주의 끝은 토요일 (2026-01-03)
    expect(weekDates[6].getFullYear()).toBe(2026);
    expect(weekDates[6].getMonth()).toBe(0); // 1월
    expect(weekDates[6].getDate()).toBe(3);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    // 2026-01-02은 금요일, 주가 2025년부터 시작됨
    const date = new Date('2026-01-02');
    const weekDates = getWeekDates(date);
    
    // 주의 시작은 일요일 (2025-12-28)
    expect(weekDates[0].getFullYear()).toBe(2025);
    expect(weekDates[0].getMonth()).toBe(11); // 12월
    expect(weekDates[0].getDate()).toBe(28);
    
    // 주의 끝은 토요일 (2026-01-03)
    expect(weekDates[6].getFullYear()).toBe(2026);
    expect(weekDates[6].getMonth()).toBe(0); // 1월
    expect(weekDates[6].getDate()).toBe(3);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    // 2024-02-29는 윤년의 목요일
    const date = new Date('2024-02-29');
    const weekDates = getWeekDates(date);
    
    // 주의 시작은 일요일 (2024-02-25)
    expect(weekDates[0].getFullYear()).toBe(2024);
    expect(weekDates[0].getMonth()).toBe(1); // 2월
    expect(weekDates[0].getDate()).toBe(25);
    
    // 2월 29일은 목요일
    expect(weekDates[4].getDate()).toBe(29);
    
    // 주의 끝은 토요일 (2024-03-02)
    expect(weekDates[6].getFullYear()).toBe(2024);
    expect(weekDates[6].getMonth()).toBe(2); // 3월
    expect(weekDates[6].getDate()).toBe(2);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    // 2025-07-31는 목요일
    const date = new Date('2025-07-31');
    const weekDates = getWeekDates(date);
    
    // 주의 시작은 일요일 (2025-07-27)
    expect(weekDates[0].getFullYear()).toBe(2025);
    expect(weekDates[0].getMonth()).toBe(6); // 7월
    expect(weekDates[0].getDate()).toBe(27);
    
    // 7월 31일은 목요일
    expect(weekDates[4].getDate()).toBe(31);
    
    // 주의 끝은 토요일 (2025-08-02)
    expect(weekDates[6].getFullYear()).toBe(2025);
    expect(weekDates[6].getMonth()).toBe(7); // 8월
    expect(weekDates[6].getDate()).toBe(2);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const date = new Date('2025-07-01');
    const weeks = getWeeksAtMonth(date);
    
    // 2025년 7월의 달력 구조 확인
    // 1일은 화요일이므로 첫 주는 [null, null, 1, 2, 3, 4, 5]
    expect(weeks[0][0]).toBeNull();
    expect(weeks[0][1]).toBeNull();
    expect(weeks[0][2]).toBe(1);
    expect(weeks[0][6]).toBe(5);
    
    // 마지막 주 확인 (7월은 31일까지)
    const lastWeek = weeks[weeks.length - 1];
    expect(lastWeek.some(day => day === 31)).toBeTruthy();
    
    // 총 주 수 확인 (2025년 7월은 5주)
    expect(weeks.length).toBe(5);
  });
});

describe('getEventsForDay', () => {
  const testEvents: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '1일 이벤트',
      location: '장소 A',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-01',
      startTime: '13:00',
      endTime: '14:00',
      description: '또 다른 1일 이벤트',
      location: '장소 B',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-07-15',
      startTime: '15:00',
      endTime: '16:00',
      description: '15일 이벤트',
      location: '장소 C',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const dayEvents = getEventsForDay(testEvents, 1);
    expect(dayEvents.length).toBe(2);
    expect(dayEvents[0].id).toBe('1');
    expect(dayEvents[1].id).toBe('2');
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const dayEvents = getEventsForDay(testEvents, 2);
    expect(dayEvents.length).toBe(0);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const dayEvents = getEventsForDay(testEvents, 0);
    expect(dayEvents.length).toBe(0);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const dayEvents = getEventsForDay(testEvents, 32);
    expect(dayEvents.length).toBe(0);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    // 2025-07-15는 화요일, 7월 3주차
    const date = new Date('2025-07-15');
    const weekInfo = formatWeek(date);
    expect(weekInfo).toBe('2025년 7월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    // 2025-07-03는 목요일, 7월 1주차
    const date = new Date('2025-07-03');
    const weekInfo = formatWeek(date);
    expect(weekInfo).toBe('2025년 7월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    // 2025-07-29는 화요일, 7월 5주차
    const date = new Date('2025-07-29');
    const weekInfo = formatWeek(date);
    expect(weekInfo).toBe('2025년 7월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    // 2025-12-30은 화요일, 1월 1주차로 처리됨
    const date = new Date('2025-12-30');
    const weekInfo = formatWeek(date);
    expect(weekInfo).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    // 2024-02-29는 목요일, 2월 5주차
    const date = new Date('2024-02-29');
    const weekInfo = formatWeek(date);
    expect(weekInfo).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    // 2025-02-27은 목요일, 2월 4주차
    const date = new Date('2025-02-27');
    const weekInfo = formatWeek(date);
    expect(weekInfo).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const date = new Date('2025-07-10');
    expect(formatMonth(date)).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2025-07-01');
  const rangeEnd = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-10');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-01');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-31');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const date = new Date('2025-06-30');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const date = new Date('2025-08-01');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const invalidRangeStart = new Date('2025-08-01');
    const invalidRangeEnd = new Date('2025-07-01');
    const date = new Date('2025-07-15');
    expect(isDateInRange(date, invalidRangeStart, invalidRangeEnd)).toBe(false);
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5)).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10)).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    expect(fillZero(3, 3)).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    expect(fillZero(100)).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0)).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    expect(fillZero(1, 5)).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    expect(fillZero(3.14, 5)).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    expect(fillZero(7)).toBe('07');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(123, 2)).toBe('123');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const date = new Date('2025-07-15');
    expect(formatDate(date)).toBe('2025-07-15');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date('2025-07-15');
    expect(formatDate(date, 20)).toBe('2025-07-20');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-01-15');
    expect(formatDate(date)).toBe('2025-01-15');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-07-05');
    expect(formatDate(date)).toBe('2025-07-05');
  });
});
