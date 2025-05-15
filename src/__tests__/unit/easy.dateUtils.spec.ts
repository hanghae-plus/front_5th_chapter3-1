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
  it('1월의 일수를 계산하여 31일을 반환한다', () => {
    expect(getDaysInMonth(2025, 1)).toBe(31);
  });

  it('4월의 일수를 계산하여 30일을 반환한다', () => {
    expect(getDaysInMonth(2025, 4)).toBe(30);
  });

  it('윤년인 2024년 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('평년인 2025년 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });

  // 유효하지 않은 월에 대해 적절히 처리한다
  it('0 이하 또는 13 이상의 유효하지 않은 월은 null을 반환한다', () => {
    expect(getDaysInMonth(2025, 13)).toBeNull();
    expect(getDaysInMonth(2025, 0)).toBeNull();
    expect(getDaysInMonth(2025, -1)).toBeNull();
  });
});

describe('getWeekDates', () => {
  const formatDateArray = (dates: Date[]) => dates.map((date) => date.toISOString().slice(0, 10));

  it('주중(수요일) 날짜에 대해 해당 주의 일요일부터 토요일까지의 날짜들을 반환한다', () => {
    const date = new Date('2025-05-14');
    expect(formatDateArray(getWeekDates(date))).toEqual([
      '2025-05-11',
      '2025-05-12',
      '2025-05-13',
      '2025-05-14',
      '2025-05-15',
      '2025-05-16',
      '2025-05-17',
    ]);
  });

  it('주의 시작(월요일)에 대해 해당 주의 일요일부터 토요일까지의 날짜들을 반환한다', () => {
    const date = new Date('2025-05-12');
    expect(formatDateArray(getWeekDates(date))).toEqual([
      '2025-05-11',
      '2025-05-12',
      '2025-05-13',
      '2025-05-14',
      '2025-05-15',
      '2025-05-16',
      '2025-05-17',
    ]);
  });

  it('주의 끝(일요일)에 대해 해당 주의 일요일부터 토요일까지의 날짜들을 반환한다', () => {
    const date = new Date('2025-05-11');
    expect(formatDateArray(getWeekDates(date))).toEqual([
      '2025-05-11',
      '2025-05-12',
      '2025-05-13',
      '2025-05-14',
      '2025-05-15',
      '2025-05-16',
      '2025-05-17',
    ]);
  });

  it('연말 날짜(12월 31일)를 기준으로 해당 주가 다음 해로 넘어가는 경우, 해당 주의 일요일부터 토요일까지의 날짜들을 반환한다', () => {
    const date = new Date('2025-12-31');
    expect(formatDateArray(getWeekDates(date))).toEqual([
      '2025-12-28',
      '2025-12-29',
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
    ]);
  });

  it('연초 날짜(1월 1일)를 기준으로 해당 주가 이전 해(12월)로 이어지는 경우, 해당 주의 일요일부터 토요일까지의 날짜들을 반환한다', () => {
    const date = new Date('2026-01-01');
    expect(formatDateArray(getWeekDates(date))).toEqual([
      '2025-12-28',
      '2025-12-29',
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
    ]);
  });

  it('윤년의 2월 29일을 포함한 주의 일요일부터 토요일까지의 날짜들을 반환한다', () => {
    const date = new Date('2024-02-29');
    expect(formatDateArray(getWeekDates(date))).toEqual([
      '2024-02-25',
      '2024-02-26',
      '2024-02-27',
      '2024-02-28',
      '2024-02-29',
      '2024-03-01',
      '2024-03-02',
    ]);
  });

  it('월의 마지막 날짜가 포함된 주의 일요일부터 토요일까지의 날짜들을 반환한다', () => {
    const date = new Date('2025-07-31');
    expect(formatDateArray(getWeekDates(date))).toEqual([
      '2025-07-27',
      '2025-07-28',
      '2025-07-29',
      '2025-07-30',
      '2025-07-31',
      '2025-08-01',
      '2025-08-02',
    ]);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월의 주의 개수가 5개 임을 확인한다', () => {
    const weeks = getWeeksAtMonth(new Date('2025-07-01'));
    expect(weeks.length).toBe(5);
  });

  it('2025년 7월의 첫 번째 주(6월 29일 ~ 7월 5일)의 날짜 배열이 올바르게 생성된다', () => {
    const weeks = getWeeksAtMonth(new Date('2025-07-01'));
    expect(weeks[0]).toEqual([null, null, 1, 2, 3, 4, 5]);
  });
});

describe('getEventsForDay', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '주간 회의',
      date: '2025-10-03',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 팀 미팅',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('2025년 10월 1일에 해당하는 이벤트만 정확히 반환한다', () => {
    const events = getEventsForDay(mockEvents, 1);
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe('1');
  });

  it('이벤트가 없는 날짜(2025년 10월 15일)에 대해 빈 배열을 반환한다', () => {
    const events = getEventsForDay(mockEvents, 15);
    expect(events).toEqual([]);
  });

  it('유효하지 않은 날짜(0일)인 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(mockEvents, 0);
    expect(events).toEqual([]);
  });

  it('유효하지 않은 날짜(32일)인 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(mockEvents, 32);
    expect(events).toEqual([]);
  });
});

describe('formatWeek', () => {
  // 주차를 계산할 때는 목요일이 기준이 됨 - ISO 8601 규격
  it('2025년 5월 13일(월)의 날짜가 포함된 주가 5월 3번째 주임을 반환한다', () => {
    const date = new Date('2025-05-13');
    expect(formatWeek(date)).toBe('2025년 5월 3주');
  });

  it('2025년 5월 1일(목)이 포함된 주가 5월 1번째 주임을 반환한다', () => {
    const date = new Date('2025-05-01');
    expect(formatWeek(date)).toBe('2025년 5월 1주');
  });

  it('2025년 5월 31일(토)이 포함된 주가 5월의 5번째 주임을 반환한다', () => {
    const date = new Date('2025-05-31');
    expect(formatWeek(date)).toBe('2025년 5월 5주');
  });

  it('2025년 12월 31일(수)가 포함된 주가 다음 해인 2026년 1월의 1번째 주임을 반환한다', () => {
    const date = new Date('2025-12-31');
    expect(formatWeek(date)).toBe('2026년 1월 1주');
  });

  it('윤년인 2024년 2월 29일(목)이 포함된 주가 2월의 5번째 주임을 반환한다', () => {
    const date = new Date('2024-02-29');
    expect(formatWeek(date)).toBe('2024년 2월 5주');
  });

  it('평년인 2025년 2월 28일(금)이 포함된 주가 2월의 4번째 주임을 반환한다', () => {
    const date = new Date('2025-02-28');
    expect(formatWeek(date)).toBe('2025년 2월 4주');
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

  it('2025년 7월 10일이 범위(2025년 7월 1일 ~ 2025년 7월 31일) 내에 있어 true를 반환한다', () => {
    const date = new Date('2025-07-10');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위 시작일인 2025년 7월 1일에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-01');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위 종료일인 2025년 7월 31일에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-31');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위 시작일 이전인 2025년 6월 30일에 대해 false를 반환한다', () => {
    const date = new Date('2025-06-30');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(false);
  });

  it('범위 종료일 이후인 2025년 8월 1일에 대해 false를 반환한다', () => {
    const date = new Date('2025-08-01');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(false);
  });

  it('시작일이 종료일보다 늦을 때, 어떤 날짜를 넣어도 false를 반환한다', () => {
    const lateRangeStart = new Date('2025-08-31');
    const earlyRangeEnd = new Date('2025-08-01');
    const testDates = [
      new Date('2025-07-15'),
      new Date('2025-08-01'),
      new Date('2025-08-31'),
      new Date('2025-09-10'),
    ];

    testDates.forEach((date) =>
      expect(isDateInRange(date, lateRangeStart, earlyRangeEnd)).toBe(false)
    );
  });
});

describe('fillZero', () => {
  test("숫자 5를 2자리 문자열로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5, 2)).toBe('05');
  });

  test("숫자 10을 2자리 문자열로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10, 2)).toBe('10');
  });

  test("숫자 3을 3자리 문자열로 변환하면 '003'을 반환한다", () => {
    expect(fillZero(3, 3)).toBe('003');
  });

  test("숫자 100을 2자리 문자열로 변환하면 원래 값인 '100'을 반환한다", () => {
    expect(fillZero(100, 2)).toBe('100');
  });

  test("숫자 0을 2자리 문자열로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0, 2)).toBe('00');
  });

  test("숫자 1을 5자리 문자열로 변환하면 '00001'을 반환한다", () => {
    expect(fillZero(1, 5)).toBe('00001');
  });

  test("소수점이 포함된 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    expect(fillZero(3.14, 5)).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2가 적용된다', () => {
    const values = [2, 10, 1000, 0, 0.5];
    const expectResults = ['02', '10', '1000', '00', '0.5'];

    values.forEach((num, index) => expect(fillZero(num)).toBe(expectResults[index]));
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 문자열로 반환한다', () => {
    const values = [100, 1000, 1000000000];
    const sizes = [1, 3, 9];

    values.forEach((num, index) => expect(fillZero(num, sizes[index])).toBe(num.toString()));
  });
});

describe('formatDate', () => {
  it('날짜를 "YYYY-MM-DD" 형식의 문자열로 포맷팅한다', () => {
    const date = new Date('2025-12-22');
    expect(formatDate(date)).toBe('2025-12-22');
  });

  it('day 파라미터가 주어지면 해당 일자를 사용하여 "YYYY-MM-DD" 형식으로 포맷팅한다', () => {
    const date = new Date('2025-12-22');
    expect(formatDate(date, 25)).toBe('2025-12-25');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-03-01');
    expect(formatDate(date)).toBe('2025-03-01');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-04-01');
    expect(formatDate(date)).toBe('2025-04-01');
  });
});
