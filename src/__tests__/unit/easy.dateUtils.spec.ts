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
    const result = getDaysInMonth(2025, 1);
    expect(result).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const result = getDaysInMonth(2025, 4);
    expect(result).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const result = getDaysInMonth(2024, 2);
    expect(result).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const result = getDaysInMonth(2025, 2);
    expect(result).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(2025, 0)).toBe(0); // 너무 작음
    expect(getDaysInMonth(2025, 13)).toBe(0); // 너무 큼
    expect(getDaysInMonth(2025, -5)).toBe(0); // 음수
    expect(getDaysInMonth(2025, 100)).toBe(0); // 터무니없이 큰 값
  });
});

describe('getWeekDates', () => {
  const format = (date: Date) => date.toISOString().slice(0, 10);

  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-05-07'); // 수요일
    const result = getWeekDates(date);
    const formatted = result.map(format);
    expect(formatted).toEqual([
      '2025-05-04', // 일
      '2025-05-05', // 월
      '2025-05-06', // 화
      '2025-05-07', // 수
      '2025-05-08', // 목
      '2025-05-09', // 금
      '2025-05-10', // 토
    ]);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-05-05'); // 월요일
    const result = getWeekDates(date);
    expect(result.map((d) => d.toISOString().slice(0, 10))).toEqual([
      '2025-05-04',
      '2025-05-05',
      '2025-05-06',
      '2025-05-07',
      '2025-05-08',
      '2025-05-09',
      '2025-05-10',
    ]);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-05-11'); // 일요일
    const result = getWeekDates(date);
    const expected = [
      new Date('2025-05-11'),
      new Date('2025-05-12'),
      new Date('2025-05-13'),
      new Date('2025-05-14'),
      new Date('2025-05-15'),
      new Date('2025-05-16'),
      new Date('2025-05-17'),
    ];
    // 문자열 비교로 테스트 (날짜 객체는 참조값 비교라 실패 가능)
    expect(result.map((d) => d.toISOString().slice(0, 10))).toEqual(
      expected.map((d) => d.toISOString().slice(0, 10))
    );
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const date = new Date('2025-12-31'); // 수요일
    const result = getWeekDates(date);
    const expected = [
      new Date('2025-12-28'),
      new Date('2025-12-29'),
      new Date('2025-12-30'),
      new Date('2025-12-31'),
      new Date('2026-01-01'),
      new Date('2026-01-02'),
      new Date('2026-01-03'),
    ];
    expect(result.map((d) => d.toISOString().slice(0, 10))).toEqual(
      expected.map((d) => d.toISOString().slice(0, 10))
    );
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const date = new Date('2025-01-01');
    const result = getWeekDates(date);
    const expected = [
      new Date('2024-12-29'), // 일
      new Date('2024-12-30'), // 월
      new Date('2024-12-31'), // 화
      new Date('2025-01-01'), // 수
      new Date('2025-01-02'), // 목
      new Date('2025-01-03'), // 금
      new Date('2025-01-04'), // 토
    ];
    expect(result.map((d) => d.toISOString().slice(0, 10))).toEqual(
      expected.map((d) => d.toISOString().slice(0, 10))
    );
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2024-02-29');
    const result = getWeekDates(date);
    const expected = [
      new Date('2024-02-25'),
      new Date('2024-02-26'),
      new Date('2024-02-27'),
      new Date('2024-02-28'),
      new Date('2024-02-29'),
      new Date('2024-03-01'),
      new Date('2024-03-02'),
    ];
    expect(result.map((d) => d.toISOString().slice(0, 10))).toEqual(
      expected.map((d) => d.toISOString().slice(0, 10))
    );
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2024-05-31');
    const result = getWeekDates(date);
    const expected = [
      new Date('2024-05-26'),
      new Date('2024-05-27'),
      new Date('2024-05-28'),
      new Date('2024-05-29'),
      new Date('2024-05-30'),
      new Date('2024-05-31'),
      new Date('2024-06-01'),
    ];
    expect(result.map((d) => d.toISOString().slice(0, 10))).toEqual(
      expected.map((d) => d.toISOString().slice(0, 10))
    );
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const date = new Date('2025-07-01'); // ✅ 명확하게 7월 1일 수요일
    const result = getWeeksAtMonth(date); // 7월

    // 결과는 "7일씩 끊긴 배열"이어야 함 (일요일~토요일)
    expect(result.length).toBeGreaterThanOrEqual(4);
    expect(result.every((week) => week.length === 7)).toBe(true);
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        date: '2025-07-01',
        title: '월초 회의',
        startTime: '',
        endTime: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
      {
        id: '2',
        date: '2025-07-02',
        title: '중요 미팅',
        startTime: '',
        endTime: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
      {
        id: '3',
        date: '2025-06-01',
        title: '지난달 회의',
        startTime: '',
        endTime: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
      {
        id: '4',
        date: '2025-07-15',
        title: '중간 점검',
        startTime: '',
        endTime: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
    ];

    const result = getEventsForDay(events, 1);

    expect(result.map(({ id, date, title }) => ({ id, date, title }))).toEqual([
      { id: '1', date: '2025-07-01', title: '월초 회의' },
      { id: '3', date: '2025-06-01', title: '지난달 회의' },
    ]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        date: '2025-07-02',
        title: '',
        startTime: '',
        endTime: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
    ];

    const result = getEventsForDay(events, 1); // ← 1일을 찾는 중

    expect(result).toHaveLength(0);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        date: '0', // invalid or unexpected
        title: '',
        startTime: '',
        endTime: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
    ];

    const result = getEventsForDay(events, 1);
    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        date: '2025-07-32',
        title: '',
        startTime: '',
        endTime: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
    ];

    const result = getEventsForDay(events, 1);

    expect(result).toEqual([]); // 유효하지 않으므로 필터링 안 됨
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-07-15'); //7월 15일 화요일
    const result = formatWeek(date);
    expect(result).toBe('2025년 7월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-07-01');
    const result = formatWeek(date);
    expect(result).toBe('2025년 7월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-07-31');
    const result = formatWeek(date);
    expect(result).toBe('2025년 7월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-12-31');
    const result = formatWeek(date);
    expect(result).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-02-29'); // 윤년의 2월 29일 (목)
    const result = getWeekDates(date);
    const expected = [
      new Date('2024-02-25'), // 일
      new Date('2024-02-26'), // 월
      new Date('2024-02-27'), // 화
      new Date('2024-02-28'), // 수
      new Date('2024-02-29'), // 목
      new Date('2024-03-01'), // 금
      new Date('2024-03-02'), // 토
    ];

    expect(result.map((d) => d.toISOString().slice(0, 10))).toEqual(
      expected.map((d) => d.toISOString().slice(0, 10))
    );
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-02-28'); // 윤년의 2월 29일 (목)
    const result = getWeekDates(date);
    const expected = [
      new Date('2025-02-23'),
      new Date('2025-02-24'),
      new Date('2025-02-25'),
      new Date('2025-02-26'),
      new Date('2025-02-27'),
      new Date('2025-02-28'),
      new Date('2025-03-01'),
    ];
    expect(result.map((d) => d.toISOString().slice(0, 10))).toEqual(
      expected.map((d) => d.toISOString().slice(0, 10))
    );
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const date = new Date('2025-07-28'); // 윤년의 2월 29일 (목)
    const result = formatMonth(date);
    expect(result).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2025-07-01');
  const rangeEnd = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {});

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {});

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {});

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {});

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {});

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {});
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {});

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {});

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {});

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {});

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {});

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {});

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {});

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {});

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {});
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {});

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {});

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {});

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {});
});
