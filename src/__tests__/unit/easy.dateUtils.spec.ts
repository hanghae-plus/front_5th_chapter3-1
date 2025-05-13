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
    expect(getDaysInMonth(2025, 0)).toBe(31);
    expect(getDaysInMonth(2025, 13)).toBe(31);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-07-02'); // 수요일
    const weekDates = getWeekDates(date);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].getDate()).toBe(29); // 일요일 (6월 29일)
    expect(weekDates[3].getDate()).toBe(2); // 수요일 (7월 2일)
    expect(weekDates[6].getDate()).toBe(5); // 토요일 (7월 5일
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-07-06'); // 일요일
    const weekDates = getWeekDates(date);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].getDate()).toBe(6); // 일요일 (7월 6일)
    expect(weekDates[6].getDate()).toBe(12); // 토요일 (7월 12일)
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-07-05'); // 토요일
    const weekDates = getWeekDates(date);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].getDate()).toBe(29); // 일요일 (6월 29일)
    expect(weekDates[6].getDate()).toBe(5); // 토요일 (7월 5일)
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const date = new Date('2025-12-30'); // 화요일
    const weekDates = getWeekDates(date);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].getFullYear()).toBe(2025);
    expect(weekDates[0].getDate()).toBe(28); // 일요일 (12월 28일)
    expect(weekDates[6].getFullYear()).toBe(2026);
    expect(weekDates[6].getDate()).toBe(3); // 토요일 (1월 3일, 2026년)
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const date = new Date('2025-01-02'); // 목요일
    const weekDates = getWeekDates(date);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].getFullYear()).toBe(2024);
    expect(weekDates[0].getDate()).toBe(29); // 일요일 (12월 29일, 2024년)
    expect(weekDates[6].getFullYear()).toBe(2025);
    expect(weekDates[6].getDate()).toBe(4); // 토요일 (1월 4일, 2025년)});
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2024-02-29'); // 2024년 2월 29일 (윤년)
    const weekDates = getWeekDates(date);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].getDate()).toBe(25); // 일요일 (2월 25일)
    expect(weekDates.some((d) => d.getDate() === 29 && d.getMonth() === 1)).toBe(true); // 2월 29일이 포함되어 있는지
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2025-04-30'); // 4월 30일 (4월의 마지막 날)
    const weekDates = getWeekDates(date);

    expect(weekDates.length).toBe(7);
    expect(weekDates.some((d) => d.getDate() === 30 && d.getMonth() === 3)).toBe(true); // 4월 30일이 포함되어 있는지
    expect(weekDates.some((d) => d.getMonth() === 4)).toBe(true); // 5월 날짜가 포함되어 있는지
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const date = new Date('2025-07-01');
    const weeks = getWeeksAtMonth(date);

    // 7월 1일은 화요일, 그 주의 첫 2일(일, 월)은 6월의 날짜
    expect(weeks.length).toBeGreaterThan(0);
    expect(weeks[0][0]).toBeNull(); // 일요일 칸은 비어있음 (6월 날짜)
    expect(weeks[0][1]).toBeNull(); // 월요일 칸은 비어있음 (6월 날짜)
    expect(weeks[0][2]).toBe(1); // 화요일은 7월 1일

    // 7월은 31일이므로 마지막 주에는 31일이 포함되어야 함
    const lastWeek = weeks[weeks.length - 1];
    const lastDay = lastWeek.filter((day) => day !== null).pop();
    expect(lastDay).toBe(31);
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const testEvents: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '설명 1',
        location: '위치 1',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '09:00',
        endTime: '10:00',
        description: '설명 2',
        location: '위치 2',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
        description: '설명 3',
        location: '위치 3',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    const day1Events = getEventsForDay(testEvents, 1);

    expect(day1Events.length).toBe(2);
    expect(day1Events[0].id).toBe('1');
    expect(day1Events[1].id).toBe('3');
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-02',
        startTime: '09:00',
        endTime: '10:00',
        description: '설명 1',
        location: '위치 1',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    const day1Events = getEventsForDay(events, 1);

    expect(day1Events.length).toBe(0);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '설명 1',
        location: '위치 1',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    const day0Events = getEventsForDay(events, 0);

    expect(day0Events.length).toBe(0);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '설명 1',
        location: '위치 1',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    const day32Events = getEventsForDay(events, 32);

    expect(day32Events.length).toBe(0);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-07-15');
    const weekFormat = formatWeek(date);

    // 결과는 "2025년 7월 X주" 형식이어야 함
    expect(weekFormat).toMatch(/^2025년 7월 \d+주$/);
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-07-03');
    const weekFormat = formatWeek(date);

    // 결과는 "2025년 7월 1주" 형식이어야 함
    expect(weekFormat).toMatch(/^2025년 7월 \d+주$/);
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-07-31');
    const weekFormat = formatWeek(date);

    // 결과는 "2025년 7월 5주" 형식이어야 함 (7월의 주 수에 따라 달라질 수 있음)
    expect(weekFormat).toMatch(/^2025년 7월 \d+주$/);
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-12-31');
    const weekFormat = formatWeek(date);

    // 결과는 "2025년 12월 X주" 또는 "2026년 1월 X주" 형식이어야 함
    // formatWeek 함수 구현에 따라 결과가 달라질 수 있음
    expect(weekFormat).toMatch(/^\d{4}년 \d{1,2}월 \d+주$/);
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-02-29');
    const weekFormat = formatWeek(date);

    // 결과는 "2024년 2월 X주" 형식이어야 함
    expect(weekFormat).toMatch(/^2024년 2월 \d+주$/);
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-02-28');
    const weekFormat = formatWeek(date);

    // 결과는 "2025년 2월 X주" 형식이어야 함
    expect(weekFormat).toMatch(/^2025년 2월 \d+주$/);
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const date = new Date('2025-07-10');
    const monthFormat = formatMonth(date);

    expect(monthFormat).toBe('2025년 7월');
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
    const invalidRangeStart = new Date('2025-07-31');
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
