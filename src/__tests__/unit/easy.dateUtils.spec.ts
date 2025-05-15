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
    expect(getDaysInMonth(2025, 13)).toBe(31);
  });
});

describe('getWeekDates', () => {

  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
      const date = new Date('2025-07-09'); // 수요일
    const expectedDates = [
      new Date('2025-07-06'),
      new Date('2025-07-07'),
      new Date('2025-07-08'),
      new Date('2025-07-09'),
      new Date('2025-07-10'),
      new Date('2025-07-11'),
      new Date('2025-07-12'),
    ];
    expect(getWeekDates(date)).toEqual(expectedDates);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const startOfWeek = new Date('2025-07-07'); // 월요일
    const expectedStartDates = [
      new Date('2025-07-06'),
      new Date('2025-07-07'),
      new Date('2025-07-08'),
      new Date('2025-07-09'),
      new Date('2025-07-10'),
      new Date('2025-07-11'),
      new Date('2025-07-12'),
    ];

    expect(getWeekDates(startOfWeek)).toEqual(expectedStartDates);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const endOfWeek = new Date('2025-07-09'); // 일요일
    const expectedEndDates = [
      new Date('2025-07-06'),
      new Date('2025-07-07'),
      new Date('2025-07-08'),
      new Date('2025-07-09'),
      new Date('2025-07-10'),
      new Date('2025-07-11'),
      new Date('2025-07-12'),
    ];

    const actualDates = getWeekDates(endOfWeek).map(date => date.toISOString());
    const expectedDates = expectedEndDates.map(date => date.toISOString());

    expect(actualDates).toStrictEqual(expectedDates);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const date = new Date('2025-12-31'); // 수요일
    const expectedDates = [
      new Date('2025-12-28'),
      new Date('2025-12-29'),
      new Date('2025-12-30'),
      new Date('2025-12-31'),
      new Date('2026-01-01'),
      new Date('2026-01-02'),
      new Date('2026-01-03'),
    ];
    expect(getWeekDates(date)).toEqual(expectedDates);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const date = new Date('2026-01-01'); // 목요일
    const expectedDates = [
      new Date('2025-12-28'),
      new Date('2025-12-29'),
      new Date('2025-12-30'),
      new Date('2025-12-31'),
      new Date('2026-01-01'),
      new Date('2026-01-02'),
      new Date('2026-01-03'),
    ];
    expect(getWeekDates(date)).toEqual(expectedDates);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2024-02-29'); // 윤년의 2월 29일
    const expectedDates = [
      new Date('2024-02-25'),
      new Date('2024-02-26'),
      new Date('2024-02-27'),
      new Date('2024-02-28'),
      new Date('2024-02-29'),
      new Date('2024-03-01'),
      new Date('2024-03-02'),
    ];
    expect(getWeekDates(date)).toEqual(expectedDates);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2025-07-31'); // 7월의 마지막 날
    const expectedDates = [
      new Date('2025-07-27'),
      new Date('2025-07-28'),
      new Date('2025-07-29'),
      new Date('2025-07-30'),
      new Date('2025-07-31'),
      new Date('2025-08-01'),
      new Date('2025-08-02'),
    ];
    expect(getWeekDates(date)).toEqual(expectedDates);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const date = new Date('2025-07-01');
    const expectedWeeks = [
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ];

    const result = getWeeksAtMonth(date);
    expect(result).toEqual(expectedWeeks);
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const events: Event[] = [
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '팀 회의',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
        title: '점심 약속',
        date: '2025-07-01',
        startTime: '12:30',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: 'fcdee123-d654-4c11-b50a-28bb983be457',
        title: '운동',
        date: '2025-07-02',
        startTime: '18:00',
        endTime: '19:00',
        description: '헬스장 방문',
        location: '피트니스 센터',
        category: '건강',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const date = 1;
    const expectedEvents = [
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '팀 회의',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
        title: '점심 약속',
        date: '2025-07-01',
        startTime: '12:30',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const result = getEventsForDay(events, date);

    expect(result).toEqual(expectedEvents);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
        const events: Event[] = [
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '팀 회의',
        date: '2025-05-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];
    const date = 1;
    const expectedEvents: Event[] = [];
    const result = getEventsForDay(events, date);
    expect(result).toEqual(expectedEvents);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
        const events: Event[] = [
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '팀 회의',
        date: '2025-05-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];
    const date = 0;
    const expectedEvents: Event[] = [];
    const result = getEventsForDay(events, date);
    expect(result).toEqual(expectedEvents);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
        const events: Event[] = [
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '팀 회의',
        date: '2025-05-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];
    const date = 32;
    const expectedEvents: Event[] = [];

    const result = getEventsForDay(events, date);
    expect(result).toEqual(expectedEvents);
  });
});
describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-07-10');
    const expected = '2025년 7월 2주';

    const result = formatWeek(date);

    expect(result).toEqual(expected);
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-07-01');
    const expected = '2025년 7월 1주';

    const result = formatWeek(date);

    expect(result).toEqual(expected);
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-07-31');
    const expected = '2025년 7월 5주';

    const result = formatWeek(date);

    expect(result).toEqual(expected);
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-12-31');
    const expected = '2026년 1월 1주';

    const result = formatWeek(date);

    expect(result).toEqual(expected);
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-02-29'); // 윤년의 2월 29일
    const expected = '2024년 2월 5주';

    const result = formatWeek(date);

    expect(result).toEqual(expected);
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-02-28'); // 평년의 2월 28일
    const expected = '2025년 2월 4주';

    const result = formatWeek(date);

    expect(result).toEqual(expected);
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const date = new Date('2025-07-10');
    const expectedFormat = '2025년 7월';
    const result = formatMonth(date);
    expect(result).toBe(expectedFormat);
  });
});
describe('isDateInRange', () => {
  const rangeStart = new Date('2025-07-01');
  const rangeEnd = new Date('2025-07-31');
  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-10');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(true);
  });
  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-01');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(true);
  });
  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-31');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(true);
  });
  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const date = new Date('2025-06-30');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(false);
  });
  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const date = new Date('2025-08-01');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(false);
  });
  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const invalidRangeStart = new Date('2025-08-01');
    const invalidRangeEnd = new Date('2025-07-31');
    const date = new Date('2025-07-10');
    const result = isDateInRange(date, invalidRangeStart, invalidRangeEnd);
    expect(result).toBe(false);
  });
});
describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const value = 5;
    const size = 2;
    const expected = '05';
    const result = fillZero(value, size);
    expect(result).toBe(expected);
  });
  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const value = 10;
    const size = 2;
    const expected = '10';
    const result = fillZero(value, size);
    expect(result).toBe(expected);
  });
  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    const value = 3;
    const size = 3;
    const expected = '003';
    const result = fillZero(value, size);
    expect(result).toBe(expected);
  });
  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const value = 100;
    const size = 2;
    const expected = '100';
    const result = fillZero(value, size);
    expect(result).toBe(expected);
  });
  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const value = 0;
    const size = 2;
    const expected = '00';
    const result = fillZero(value, size);
    expect(result).toBe(expected);
  });
  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    const value = 1;
    const size = 5;
    const expected = '00001';
    const result = fillZero(value, size);
    expect(result).toBe(expected);
  });
  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    const value = 3.14;
    const size = 5;
    const expected = '03.14';
    const result = fillZero(value, size);
    expect(result).toBe(expected);
  });
  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    const value = 5;
    const expected = '05';
    const result = fillZero(value);
    expect(result).toBe(expected);
  });
  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const value = 12345;
    const size = 2;
    const expected = '12345';
    const result = fillZero(value, size);
    expect(result).toBe(expected);
  });
});
describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const date = new Date('2025-07-10');
    const expectedFormat = '2025-07-10';
    const result = formatDate(date);
    expect(result).toBe(expectedFormat);
  });
  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date('2025-07-10');
    const day = 15;
    const expectedFormat = '2025-07-15';
    const result = formatDate(date, day);
    expect(result).toBe(expectedFormat);
  });
  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-07-01');
    const expectedFormat = '2025-07-01';
    const result = formatDate(date);
    expect(result).toBe(expectedFormat);
  });
  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-07-01');
    const expectedFormat = '2025-07-01';
    const result = formatDate(date);
    expect(result).toBe(expectedFormat);
  });
});
