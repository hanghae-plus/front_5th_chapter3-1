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

/**
 * @description getDaysInMonth -> 주어진 년도와 월의 일수를 반환합니다. (getDaysInMonth)
 */
describe('주어진 년도와 월의 일수를 반환합니다 (getDaysInMonth)', () => {
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

  /**
   * @description 유효하지 않은 월에 대해 적절히 처리한다 -> 유효하지 않은 월에 대해 0을 반환한다. (적절히 처리라는 것이 무슨 의미인지 모르므로 명확히 표시)
   */
  it('유효하지 않은 월에 대해 0을 반환한다', () => {
    const result = getDaysInMonth(2025, 13);

    expect(result).toBe(0);
  });
});

/**
 * @description getWeekDates -> 주어진 날짜가 속한 주의 모든 날짜를 반환합니다. (getWeekDates)
 */
describe('주어진 날짜가 속한 주의 모든 날짜를 반환합니다 (getWeekDates)', () => {
  /**
   * @description 주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다 -> 주중의 날짜(수요일)에 대해 해당 주의 포함되는 날짜들을 반환한다
   */
  it('주중의 날짜(수요일)에 대해 해당 주의 포함되는 날짜들을 반환한다', () => {
    const currentDate = new Date('2025-05-14');
    const result = getWeekDates(currentDate);

    expect(result).toEqual([
      new Date('2025-05-11'),
      new Date('2025-05-12'),
      new Date('2025-05-13'),
      new Date('2025-05-14'),
      new Date('2025-05-15'),
      new Date('2025-05-16'),
      new Date('2025-05-17'),
    ]);
  });

  /**
   * @description 주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다 -> 주의 시작(월요일)에 대해 해당 주의 포함되는 날짜들을 반환한다
   */
  it('주의 시작(월요일)에 대해 해당 주의 포함되는 날짜들을 반환한다', () => {
    const currentDate = new Date('2025-05-12');
    const result = getWeekDates(currentDate);

    expect(result).toEqual([
      new Date('2025-05-11'),
      new Date('2025-05-12'),
      new Date('2025-05-13'),
      new Date('2025-05-14'),
      new Date('2025-05-15'),
      new Date('2025-05-16'),
      new Date('2025-05-17'),
    ]);
  });

  /**
   * @description 주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다 -> 주의 끝(일요일)에 대해 해당 주의 포함되는 날짜들을 반환한다
   */
  it('주의 끝(일요일)에 대해 해당 주의 포함되는 날짜들을 반환한다', () => {
    const currentDate = new Date('2025-05-11');
    const result = getWeekDates(currentDate);

    expect(result).toEqual([
      new Date('2025-05-11'),
      new Date('2025-05-12'),
      new Date('2025-05-13'),
      new Date('2025-05-14'),
      new Date('2025-05-15'),
      new Date('2025-05-16'),
      new Date('2025-05-17'),
    ]);
  });

  /**
   * @description 연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말) -> 연도를 넘어가는 주의 포함되는 날짜들을 반환한다 (연말)
   */
  it('연도를 넘어가는 주의 포함되는 날짜들을 반환한다 (연말)', () => {
    const currentDate = new Date('2025-12-31');
    const result = getWeekDates(currentDate);

    expect(result).toEqual([
      new Date('2025-12-28'),
      new Date('2025-12-29'),
      new Date('2025-12-30'),
      new Date('2025-12-31'),
      new Date('2026-01-01'),
      new Date('2026-01-02'),
      new Date('2026-01-03'),
    ]);
  });

  /**
   * @description 연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초) -> 연도를 넘어가는 주의 날짜를 날짜들을 반환한다 (연초)
   */
  it('연도를 넘어가는 주의 날짜를 날짜들을 반환한다 (연초)', () => {
    const currentDate = new Date('2026-01-01');
    const result = getWeekDates(currentDate);

    expect(result).toEqual([
      new Date('2025-12-28'),
      new Date('2025-12-29'),
      new Date('2025-12-30'),
      new Date('2025-12-31'),
      new Date('2026-01-01'),
      new Date('2026-01-02'),
      new Date('2026-01-03'),
    ]);
  });

  /**
   * @description 윤년의 2월 29일을 포함한 주를 올바르게 처리한다 -> 윤년의 2월 29일을 포함한 주의 날짜들을 반환한다
   */
  it('윤년의 2월 29일을 포함한 주의 날짜들을 반환한다', () => {
    const currentDate = new Date('2024-02-29');
    const result = getWeekDates(currentDate);

    expect(result).toEqual([
      new Date('2024-02-25'),
      new Date('2024-02-26'),
      new Date('2024-02-27'),
      new Date('2024-02-28'),
      new Date('2024-02-29'),
      new Date('2024-03-01'),
      new Date('2024-03-02'),
    ]);
  });

  /**
   * @description 월의 마지막 날짜를 포함한 주를 올바르게 처리한다 -> 월의 마지막 날짜를 포함한 주의 날짜들을 반환한다
   */
  it('월의 마지막 날짜를 포함한 주의 날짜들을 반환한다', () => {
    const currentDate = new Date('2025-05-31');
    const result = getWeekDates(currentDate);

    expect(result).toEqual([
      new Date('2025-05-25'),
      new Date('2025-05-26'),
      new Date('2025-05-27'),
      new Date('2025-05-28'),
      new Date('2025-05-29'),
      new Date('2025-05-30'),
      new Date('2025-05-31'),
    ]);
  });
});

describe('getWeeksAtMonth', () => {
  /**
   * @description 2025년 7월 1일의 올바른 주 정보를 반환해야 한다 -> 2025년 7월의 주마다의 모든 날짜를 반환합니다
   */
  it('2025년 7월의 주마다의 모든 날짜를 반환합니다', () => {
    const currentDate = new Date('2025-07-01');
    const result = getWeeksAtMonth(currentDate);

    expect(result).toMatchObject([
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ]);
  });
});

/**
 * @description getEventsForDay -> 주어진 날짜에 해당하는 이벤트를 반환합니다. (getEventsForDay)
 */
describe('주어진 날짜에 해당하는 이벤트를 반환합니다 (getEventsForDay)', () => {
  let events: Event[];

  beforeEach(async () => {
    events = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
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
        title: '새로운 회의',
        date: '2025-05-01',
        startTime: '10:00',
        endTime: '12:00',
        description: '새로운 팀 미팅',
        location: '회의실 C',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
  });

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', async () => {
    const currentDate = new Date('2025-05-01');
    const result = getEventsForDay(events, currentDate.getDate());

    expect(result).toEqual([events[1]]);
  });
  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const currentDate = new Date('2025-05-23');
    const result = getEventsForDay(events, currentDate.getDate());

    expect(result).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const currentDate = new Date('2025-05-00');
    const result = getEventsForDay(events, currentDate.getDate());

    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const currentDate = new Date('2025-05-32');
    const result = getEventsForDay(events, currentDate.getDate());

    expect(result).toEqual([]);
  });
});

/**
 * @description formatWeek -> 주어진 날짜에 대한 x년 x월 x주 정보를 반환합니다. (formatWeek)
 */
describe('주어진 날짜에 대한 x년 x월 x주 정보를 반환합니다 (formatWeek)', () => {
  /**
   * @description 월의 중간 날짜에 대해 올바른 주 정보를 반환한다 -> 월의 중간 주간 날짜
   */
  it('월의 중간 주간 날짜', () => {
    const currentDate = new Date('2025-05-15');
    const result = formatWeek(currentDate);

    expect(result).toBe('2025년 5월 3주');
  });

  /**
   * @description 월의 첫 주에 대해 올바른 주 정보를 반환한다 -> 월의 첫 주간 날짜
   */
  it('월의 첫 주간 날짜', () => {
    const currentDate = new Date('2025-05-01');
    const result = formatWeek(currentDate);

    expect(result).toBe('2025년 5월 1주');
  });

  /**
   * @description 월의 마지막 주에 대해 올바른 주 정보를 반환한다 -> 월의 마지막 주간 날짜
   */
  it('월의 마지막 주간 날짜', () => {
    const currentDate = new Date('2025-05-31');
    const result = formatWeek(currentDate);

    expect(result).toBe('2025년 5월 5주');
  });

  /**
   * @description 연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다 -> 연도가 바뀌는 주간 날짜
   */
  it('연도가 바뀌는 주간 날짜', () => {
    const currentDate = new Date('2026-01-01');
    const result = formatWeek(currentDate);

    expect(result).toBe('2026년 1월 1주');
  });

  /**
   * @description 윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다 -> 윤년 2월의 마지막 주간 날짜
   */
  it('윤년 2월의 마지막 주간 날짜', () => {
    const currentDate = new Date('2024-02-29');
    const result = formatWeek(currentDate);

    expect(result).toBe('2024년 2월 5주');
  });

  /**
   * @description 평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다 -> 평년 2월의 마지막 주간 날짜
   */
  it('평년 2월의 마지막 주간 날짜', () => {
    const currentDate = new Date('2025-02-28');
    const result = formatWeek(currentDate);

    expect(result).toBe('2025년 2월 4주');
  });
});

/**
 * @description formatMonth -> 주어진 날짜에 대한 x년 x월 정보를 반환합니다. (formatMonth)
 */
describe('주어진 날짜에 대한 x년 x월 정보를 반환합니다. (formatMonth)', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const currentDate = new Date('2025-07-10');
    const result = formatMonth(currentDate);

    expect(result).toBe('2025년 7월');
  });
});

/**
 * @description isDateInRange -> 주어진 날짜가 범위 내에 있는지 확인합니다. (isDateInRange)
 */
describe('주어진 날짜가 범위 내에 있는지 확인합니다. (isDateInRange)', () => {
  const rangeStart = new Date('2025-07-01');
  const rangeEnd = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const currentDate = new Date('2025-07-10');
    const result = isDateInRange(currentDate, rangeStart, rangeEnd);

    expect(result).toBeTruthy();
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const currentDate = new Date('2025-07-01');
    const result = isDateInRange(currentDate, rangeStart, rangeEnd);

    expect(result).toBeTruthy();
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const currentDate = new Date('2025-07-31');
    const result = isDateInRange(currentDate, rangeStart, rangeEnd);

    expect(result).toBeTruthy();
  });
  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const currentDate = new Date('2025-06-30');
    const result = isDateInRange(currentDate, rangeStart, rangeEnd);

    expect(result).toBeFalsy();
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const currentDate = new Date('2025-08-01');
    const result = isDateInRange(currentDate, rangeStart, rangeEnd);

    expect(result).toBeFalsy();
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const rangeStart = new Date('2025-07-31');
    const rangeEnd = new Date('2025-07-01');
    const result = isDateInRange(new Date('2025-07-10'), rangeStart, rangeEnd);

    expect(result).toBeFalsy();
  });
});

/**
 * @description fillZero -> 주어진 자리수에 0을 채워서 반환합니다. (fillZero)
 */
describe('주어진 자리수에 0을 채워서 반환합니다. (fillZero)', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const result = fillZero(5);

    expect(result).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const result = fillZero(10);

    expect(result).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    const result = fillZero(3, 3);

    expect(result).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const result = fillZero(100);

    expect(result).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const result = fillZero(0);

    expect(result).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    const result = fillZero(1, 5);

    expect(result).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    const result = fillZero(3.14, 5);

    expect(result).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    const result = fillZero(1);

    expect(result).toBe('01');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const result = fillZero(12345);

    expect(result).toBe('12345');
  });
});

/**
 * @description formatDate -> 주어진 날짜를 YYYY-MM-DD 형식으로 포맷팅합니다. (formatDate)
 */
describe('주어진 날짜를 YYYY-MM-DD 형식으로 포맷팅합니다. (formatDate)', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const result = formatDate(new Date('2025-05-12'));

    expect(result).toBe('2025-05-12');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const result = formatDate(new Date('2025-05-12'), 10);

    expect(result).toBe('2025-05-10');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const result = formatDate(new Date('2025-5-12'));

    expect(result).toBe('2025-05-12');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const result = formatDate(new Date('2025-05-1'));

    expect(result).toBe('2025-05-01');
  });
});
