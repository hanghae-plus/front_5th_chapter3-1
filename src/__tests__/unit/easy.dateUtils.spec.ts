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

const mockEvents: Event[] = [
  {
    id: '1',
    title: '회의 1',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'none',
      interval: 1,
      endDate: undefined,
    },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '회의 2',
    date: '2025-07-01',
    startTime: '11:00',
    endTime: '12:00',
    description: '프로젝트 회의',
    location: '회의실 B',
    category: '업무',
    repeat: {
      type: 'none',
      interval: 1,
      endDate: undefined,
    },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '점심 약속',
    date: '2025-07-02',
    startTime: '12:00',
    endTime: '13:00',
    description: '친구와 점심',
    location: '카페',
    category: '개인',
    repeat: {
      type: 'none',
      interval: 1,
      endDate: undefined,
    },
    notificationTime: 10,
  },
  {
    id: '4',
    title: '다른 달의 같은 날',
    date: '2025-08-01',
    startTime: '14:00',
    endTime: '15:00',
    description: '8월 이벤트',
    location: '오피스',
    category: '업무',
    repeat: {
      type: 'none',
      interval: 1,
      endDate: undefined,
    },
    notificationTime: 10,
  },
];

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
    const result = getDaysInMonth(2025, 13);
    expect(result).toBe(31);
  });
});

describe('getWeekDates', () => {
  it('수요일 날짜에 대해 주 일요일부터 토요일까지 반환한다', () => {
    const result = getWeekDates(new Date('2025-07-09')); // 수요일
    const days = result.map((d) => d.toDateString());
    expect(days[0]).toBe(new Date('2025-07-06').toDateString()); // 일
    expect(days[6]).toBe(new Date('2025-07-12').toDateString()); // 토
    expect(days).toHaveLength(7);
  });

  it('월요일에 대해 동일한 주의 일요일부터 반환한다', () => {
    const result = getWeekDates(new Date('2025-07-07'));
    expect(result[0].getDay()).toBe(0); // 일요일
  });

  it('일요일이면 해당 날짜부터 시작한다', () => {
    const result = getWeekDates(new Date('2025-07-06'));
    expect(result[0].toDateString()).toBe(new Date('2025-07-06').toDateString());
  });

  it('연말 날짜(2024-12-31)도 다음 해 포함 주로 반환된다', () => {
    const result = getWeekDates(new Date('2024-12-31'));
    const days = result.map((d) => d.toISOString().slice(0, 10));
    expect(days).toContain('2025-01-01');
  });

  it('연초 날짜(2025-01-01)도 전 해 포함 주로 반환된다', () => {
    const result = getWeekDates(new Date('2025-01-01'));
    const days = result.map((d) => d.toISOString().slice(0, 10));
    expect(days).toContain('2024-12-29');
  });

  it('윤년 2월 29일을 포함하는 주를 올바르게 반환한다', () => {
    const result = getWeekDates(new Date('2024-02-29'));
    const days = result.map((d) => d.toISOString().slice(0, 10));
    expect(days).toContain('2024-02-29');
    expect(days).toHaveLength(7);
  });

  it('월의 마지막 날(2025-08-31)을 포함하는 주도 처리된다', () => {
    const result = getWeekDates(new Date('2025-08-31'));
    const lastDay = result.find((d) => d.getDate() === 31);
    expect(lastDay).toBeDefined();
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const weeks = getWeeksAtMonth(new Date('2025-07-01'));

    // 각 주는 배열 7칸 (일~토)
    expect(weeks.every((week) => week.length === 7)).toBe(true);

    // 1일은 화요일이므로 첫 주에 위치
    expect(weeks[0]).toEqual([null, null, 1, 2, 3, 4, 5]);

    // 마지막 주에 31일 포함 확인
    const flattened = weeks.flat();
    expect(flattened).toContain(31);

    // 총 주 수 확인 (2025년 7월은 5주니까..)
    expect(weeks.length).toBe(5);
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const result = getEventsForDay(mockEvents, 1);
    const titles = result.map((e) => e.title);
    expect(titles).toContain('회의 1');
    expect(titles).toContain('회의 2');
    expect(titles).toContain('다른 달의 같은 날'); // 동일한 '일자' 기준이므로 포함됨
    expect(titles).not.toContain('점심 약속');
    expect(result.length).toBe(3);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(mockEvents, 5);
    expect(result).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(mockEvents, 0);
    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(mockEvents, 32);
    expect(result).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-07-10')); // 목요일
    expect(result).toBe('2025년 7월 2주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-07-01')); // 화요일
    expect(result).toBe('2025년 7월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-07-31')); // 목요일
    expect(result).toBe('2025년 7월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2024-12-31')); // 화요일
    expect(result).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2024-02-29')); // 목요일
    expect(result).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-02-28')); // 금요일
    expect(result).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const result = formatMonth(new Date('2025-07-10'));
    expect(result).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2025-07-01');
  const rangeEnd = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const result = isDateInRange(new Date('2025-07-10'), rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const result = isDateInRange(new Date('2025-07-01'), rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const result = isDateInRange(new Date('2025-07-31'), rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const result = isDateInRange(new Date('2025-06-30'), rangeStart, rangeEnd);
    expect(result).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const result = isDateInRange(new Date('2025-08-01'), rangeStart, rangeEnd);
    expect(result).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const result = isDateInRange(new Date('2025-07-10'), rangeEnd, rangeStart);
    expect(result).toBe(false);
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5, 2)).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10, 2)).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    expect(fillZero(3, 3)).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    expect(fillZero(100, 2)).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0, 2)).toBe('00');
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
    expect(fillZero(9999, 3)).toBe('9999');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const result = formatDate(new Date('2025-07-10'));
    expect(result).toBe('2025-07-10');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const result = formatDate(new Date('2025-07-10'), 1);
    expect(result).toBe('2025-07-01');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const result = formatDate(new Date('2025-03-10'));
    expect(result).toBe('2025-03-10');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const result = formatDate(new Date('2025-07-05'));
    expect(result).toBe('2025-07-05');
  });
});
