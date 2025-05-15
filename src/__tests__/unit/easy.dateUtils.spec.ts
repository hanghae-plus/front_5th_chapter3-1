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
import { assertDate} from "../utils";
import {expect} from "vitest";

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
    expect(getDaysInMonth(2025, 0)).toBe(31);
    expect(getDaysInMonth(2025, 13)).toBe(31);
  });
});

describe('getWeekDates', () => {
  it('다양한 요일에 대해 올바른 주의 날짜들을 반환한다.', () => {
    const testDates = [
      { input: new Date('2025-05-14'), dayOfWeek: 3 }, // 수요일
      { input: new Date('2025-05-11'), dayOfWeek: 0 }, // 일요일
      { input: new Date('2025-05-17'), dayOfWeek: 6 }, // 토요일
    ];

    for (const { input, dayOfWeek } of testDates) {
      const weekDates = getWeekDates(input);

      expect(weekDates.length).toBe(7);
      assertDate(weekDates[0], new Date('2025-05-11')); // 같은 주의 일요일
      assertDate(weekDates[dayOfWeek], input); // 입력 날짜가 같은지 확인
    }
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const testDate = new Date('2025-12-30');
    const weekDates = getWeekDates(testDate);

    expect(weekDates.length).toBe(7);

    assertDate(weekDates[0], new Date('2025-12-28'));
    assertDate(weekDates[6], new Date('2026-01-03'));
    assertDate(weekDates[4], new Date('2026-01-01'));
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const testDate = new Date('2025-01-02');
    const weekDates = getWeekDates(testDate);

    console.log('테스트 날짜:', testDate.toISOString());
    console.log('주 날짜들:');
    weekDates.forEach((date, i) => {
      console.log(`날짜 ${i}:`, date.toISOString(), '요일:', date.getDay());
    });

    expect(weekDates.length).toBe(7);

    assertDate(weekDates[0], new Date('2024-12-29'));
    assertDate(weekDates[6], new Date('2025-01-04'));
    assertDate(weekDates[3], new Date('2025-01-01'));
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const testDate = new Date('2024-02-29');
    const weekDates = getWeekDates(testDate);

    expect(weekDates.length).toBe(7);

    assertDate(weekDates[0], new Date('2024-02-25'));
    assertDate(weekDates[4], testDate);
    assertDate(weekDates[6], new Date('2024-03-02'));
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const testDate = new Date('2025-04-30');
    const weekDates = getWeekDates(testDate);

    expect(weekDates.length).toBe(7);

    assertDate(weekDates[0], new Date('2025-04-27'));
    assertDate(weekDates[3], testDate);
    assertDate(weekDates[6], new Date('2025-05-03'));
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const testDate = new Date('2025-07-01');
    const weekData = getWeeksAtMonth(testDate);

    expect(weekData.length).toBe(5);
    expect(weekData[0]).toEqual([null, null, 1, 2, 3, 4, 5]);
    expect(weekData[1]).toEqual([6, 7, 8, 9, 10, 11, 12]);
    expect(weekData[2]).toEqual([13, 14, 15, 16, 17, 18, 19]);
    expect(weekData[3]).toEqual([20, 21, 22, 23, 24, 25, 26]);
    expect(weekData[4]).toEqual([27, 28, 29, 30, 31, null, null]);
  });
});

describe('getEventsForDay', () => {
  const sampleEvents: Event[] = [
    {
      id: '1',
      title: '1일 회의',
      date: '2025-05-01', // 1일
      startTime: '09:00',
      endTime: '10:00',
      description: '1일 정기 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10
    },
    {
      id: '2',
      title: '15일 워크샵',
      date: '2025-05-15', // 15일
      startTime: '13:00',
      endTime: '17:00',
      description: '팀 워크샵',
      location: '컨퍼런스룸',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30
    },
    {
      id: '3',
      title: '1일 생일 파티',
      date: '2025-05-01', // 1일 (중복)
      startTime: '18:00',
      endTime: '21:00',
      description: '팀원 생일 축하',
      location: '레스토랑',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 60
    }
  ];
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const result = getEventsForDay(sampleEvents, 1);

    expect(result.length).toBe(2);

    expect(result.map(event => event.id)).toContain('1');
    expect(result.map(event => event.id)).toContain('3');

    expect(result.every(event => new Date(event.date).getDate() === 1)).toBe(true);

    expect(result.map(event => event.id)).not.toContain('2');
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(sampleEvents, 10);

    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(sampleEvents, 0);

    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(sampleEvents, 32);

    expect(result).toEqual([]);
    expect(result.length).toBe(0);

    const result2 = getEventsForDay(sampleEvents, 33);
    expect(result2).toEqual([]);
    expect(result2.length).toBe(0);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = new Date('2025-05-16');
    const result = formatWeek(targetDate);

    expect(result).toBe('2025년 5월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = new Date('2025-05-01');
    const result = formatWeek(targetDate);
    expect(result).toBe('2025년 5월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = new Date('2025-05-30');
    const result = formatWeek(targetDate);
    expect(result).toBe('2025년 5월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = new Date('2025-12-30');
    const result = formatWeek(targetDate);

    expect(result).toBe('2025년 12월 5주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = new Date('2024-02-29');
    const result = formatWeek(targetDate);

    expect(result).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = new Date('2025-02-28');
    const result = formatWeek(targetDate);

    expect(result).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const targetDate = new Date('2025-07-10');
    const result = formatMonth(targetDate);

    expect(result).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2025-07-01');
  const rangeEnd = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const testDate = new Date('2025-07-10');
    expect(isDateInRange(testDate, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    expect(isDateInRange(rangeStart, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    expect(isDateInRange(rangeEnd, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const testDate = new Date('2025-06-30');
    expect(isDateInRange(testDate, rangeStart, rangeEnd)).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const testDate = new Date('2025-08-01');
    expect(isDateInRange(testDate, rangeStart, rangeEnd)).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const reversedStart = new Date('2025-07-31');
    const reversedEnd = new Date('2025-07-01');
    const testDate = new Date('2025-07-15');
    expect(isDateInRange(testDate, reversedStart, reversedEnd)).toBe(false);
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
    const date = new Date('2025-05-15');

    expect(formatDate(date)).toBe('2025-05-15');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date('2025-05-15');

    expect(formatDate(date, 20)).toBe('2025-05-20');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-5-15');

    expect(formatDate(date)).toBe('2025-05-15');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-5-5');
    expect(formatDate(date)).toBe('2025-05-05');
  });
});
