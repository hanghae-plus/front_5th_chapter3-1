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
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(2025, -1)).toBe(30);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const wednesday = new Date(2025, 4, 7);
    const weekDates = getWeekDates(wednesday);
    // 해당 주중의 날짜 : 5/4(일) ~ 5/10(토)
    expect(weekDates.length).toBe(7);
    expect(weekDates[0].getDate()).toBe(4);
    expect(weekDates[1].getDate()).toBe(5);
    expect(weekDates[2].getDate()).toBe(6);
    expect(weekDates[3].getDate()).toBe(7);
    expect(weekDates[4].getDate()).toBe(8);
    expect(weekDates[5].getDate()).toBe(9);
    expect(weekDates[6].getDate()).toBe(10);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const monday = new Date(2025, 4, 4);
    const weekDates = getWeekDates(monday);
    // 해당 주중의 날짜 : 5/4(일) ~ 5/10(토)
    expect(weekDates.length).toBe(7);
    expect(weekDates[0].getDate()).toBe(4);
    expect(weekDates[1].getDate()).toBe(5);
    expect(weekDates[2].getDate()).toBe(6);
    expect(weekDates[3].getDate()).toBe(7);
    expect(weekDates[4].getDate()).toBe(8);
    expect(weekDates[5].getDate()).toBe(9);
    expect(weekDates[6].getDate()).toBe(10);

    // 모든 날짜가 2025년인지 체크
    weekDates.forEach((date) => {
      expect(date.getFullYear()).toBe(2025);
    });
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const sunday = new Date(2025, 4, 4);
    const weekDates = getWeekDates(sunday);
    // 해당 주중의 날짜 : 5/4(일) ~ 5/10(토)
    expect(weekDates.length).toBe(7);
    expect(weekDates[0].getDate()).toBe(4);
    expect(weekDates[1].getDate()).toBe(5);
    expect(weekDates[2].getDate()).toBe(6);
    expect(weekDates[3].getDate()).toBe(7);
    expect(weekDates[4].getDate()).toBe(8);
    expect(weekDates[5].getDate()).toBe(9);
    expect(weekDates[6].getDate()).toBe(10);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    // 2025년 12월 30일 (화요일)
    const endOfYear = new Date(2025, 11, 30);
    const weekDates = getWeekDates(endOfYear);

    // 해당 주의 날짜: 12/28(일) ~ 1/3(토)
    expect(weekDates.length).toBe(7);

    // 연말 날짜
    expect(weekDates[3].getDate()).toBe(31);
    expect(weekDates[3].getMonth()).toBe(11);
    expect(weekDates[3].getFullYear()).toBe(2025);

    // 연초 날짜 (2026년으로 넘어가는 부분)
    expect(weekDates[4].getDate()).toBe(1);
    expect(weekDates[4].getMonth()).toBe(0);
    expect(weekDates[4].getFullYear()).toBe(2026);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    // 2025년 1월 2일 (목요일)
    const startOfYear = new Date(2025, 0, 2);
    const weekDates = getWeekDates(startOfYear);

    // 해당 주의 날짜: 12/29(일) ~ 1/4(토)
    expect(weekDates.length).toBe(7);

    // 작년 날짜
    expect(weekDates[2].getDate()).toBe(31);
    expect(weekDates[2].getMonth()).toBe(11);
    expect(weekDates[2].getFullYear()).toBe(2024);

    // 올해 날짜
    expect(weekDates[3].getDate()).toBe(1);
    expect(weekDates[3].getMonth()).toBe(0); // 1월 (0-based)
    expect(weekDates[3].getFullYear()).toBe(2025);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    // 2024년은 윤년
    const leapDay = new Date(2024, 1, 29);
    const weekDates = getWeekDates(leapDay);

    // 해당 주의 날짜: 2/25(일) ~ 3/2(토)
    expect(weekDates.length).toBe(7);

    // 2월 날짜
    expect(weekDates[4].getDate()).toBe(29);
    expect(weekDates[4].getMonth()).toBe(1);

    // 3월로 넘어가는 날짜
    expect(weekDates[5].getDate()).toBe(1);
    expect(weekDates[5].getMonth()).toBe(2);

    // 모든 날짜가 같은 연도인지 확인
    weekDates.forEach((date) => {
      expect(date.getFullYear()).toBe(2024);
    });
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    // 2025년 9월 30일 (화요일)
    const endOfMonth = new Date(2025, 8, 30);
    const weekDates = getWeekDates(endOfMonth);

    // 해당 주의 날짜: 9/28(일) ~ 10/4(토)
    expect(weekDates.length).toBe(7);

    // 9월 날짜
    expect(weekDates[2].getDate()).toBe(30);
    expect(weekDates[2].getMonth()).toBe(8);

    // 10월로 넘어가는 날짜
    expect(weekDates[3].getDate()).toBe(1);
    expect(weekDates[3].getMonth()).toBe(9);

    // 모든 날짜가 같은 연도인지 확인
    weekDates.forEach((date) => {
      expect(date.getFullYear()).toBe(2025);
    });
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const date = new Date(2025, 6, 1); // 2025년 7월 1일
    const weeks = getWeeksAtMonth(date);

    // 첫째 주
    expect(weeks[0]).toEqual([null, null, 1, 2, 3, 4, 5]);

    // 둘째 주
    expect(weeks[1]).toEqual([6, 7, 8, 9, 10, 11, 12]);

    // 셋째 주
    expect(weeks[2]).toEqual([13, 14, 15, 16, 17, 18, 19]);

    // 넷째 주
    expect(weeks[3]).toEqual([20, 21, 22, 23, 24, 25, 26]);

    // 다섯째 주
    expect(weeks[4]).toEqual([27, 28, 29, 30, 31, null, null]);

    // 총 5주
    expect(weeks.length).toBe(5);
  });
});

describe('getEventsForDay', () => {
  // 테스트용 이벤트
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      description: '주간 스프린트 계획 회의',
      location: '회의실 A',
      date: '2025-10-01',
      startTime: '10:00',
      endTime: '11:00',
    },
    {
      id: '2',
      title: '고객 미팅',
      description: '신규 고객 요구사항 회의',
      location: '회의실 B',
      date: '2025-10-01',
      startTime: '14:00',
      endTime: '15:00',
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const day1Events = getEventsForDay(mockEvents, 1);
    day1Events.forEach((event) => {
      const eventDate = new Date(event.date);
      expect(eventDate.getDate()).toBe(1);
    });
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const day15Events = getEventsForDay(mockEvents, 15);
    expect(day15Events).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const day0Events = getEventsForDay(mockEvents, 0);
    expect(day0Events).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const day32Events = getEventsForDay(mockEvents, 32);
    expect(day32Events).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const midMonth = new Date(2025, 9, 15);
    const formattedWeek = formatWeek(midMonth);
    expect(formattedWeek).toBe('2025년 10월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const firstDayOfMonth = new Date(2025, 5, 1);
    const formattedWeek = formatWeek(firstDayOfMonth);
    expect(formattedWeek).toBe('2025년 6월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const lastDayOfMonth = new Date(2025, 3, 23);
    const formattedWeek = formatWeek(lastDayOfMonth);
    expect(formattedWeek).toBe('2025년 4월 4주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const lastDayOfYear = new Date(2025, 11, 31);
    const formattedWeek = formatWeek(lastDayOfYear);
    expect(formattedWeek).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const leapYear = new Date(2024, 1, 29);
    const formattedWeek = formatWeek(leapYear);
    expect(formattedWeek).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const regularYear = new Date(2025, 1, 28);
    const formattedWeek = formatWeek(regularYear);
    expect(formattedWeek).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const date = new Date(2025, 6, 10);
    const formattedMonth = formatMonth(date);
    expect(formattedMonth).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2025-07-01');
  const rangeEnd = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const testDate = new Date('2025-07-10');
    const result = isDateInRange(testDate, rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const testDate = new Date('2025-07-01');
    const result = isDateInRange(testDate, rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const testDate = new Date('2025-07-31');
    const result = isDateInRange(testDate, rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const testDate = new Date('2025-06-30');
    const result = isDateInRange(testDate, rangeStart, rangeEnd);
    expect(result).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const testDate = new Date('2025-08-01');
    const result = isDateInRange(testDate, rangeStart, rangeEnd);
    expect(result).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const startDate = new Date('2025-08-01');
    const endDate = new Date('2025-07-01');
    const testDate = new Date('2025-07-15');
    expect(isDateInRange(testDate, startDate, endDate)).toBe(false);
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
    expect(fillZero(100, 2)).toBe('100');
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
    const date = new Date(2025, 4, 14);
    const formattedDate = formatDate(date);
    expect(formattedDate).toBe('2025-05-14');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date(2025, 4, 14);
    const formattedDate = formatDate(date, 15);
    expect(formattedDate).toBe('2025-05-15');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date(2025, 0, 14);
    const formattedDate = formatDate(date);
    expect(formattedDate).toBe('2025-01-14');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date(2025, 6, 5);
    const formattedDate = formatDate(date);
    expect(formattedDate).toBe('2025-07-05');
  });
});
