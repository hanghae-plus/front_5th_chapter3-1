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
import { assertDate } from '../utils';
describe('getDaysInMonth: 주어진 년도와 월의 일수를 반환합니다.', () => {
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

  it('유효하지 않은 월에 대해 0을 반환한다', () => {
    const result = getDaysInMonth(2025, 13);
    expect(result).toBe(0);
  });
});

describe('getWeekDates: 주어진 날짜가 속한 주의 모든 날짜를 반환합니다.', () => {
  /** @description 주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다 */
  it('주중의 날짜(수요일)에 대해 해당되는 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-05-14');
    const result = getWeekDates(date);

    assertDate(result[0], new Date('2025-05-11'));
    assertDate(result[1], new Date('2025-05-12'));
    assertDate(result[2], new Date('2025-05-13'));
    assertDate(result[3], new Date('2025-05-14'));
    assertDate(result[4], new Date('2025-05-15'));
    assertDate(result[5], new Date('2025-05-16'));
    assertDate(result[6], new Date('2025-05-17'));
  });

  /** @description 주의 시작(일요일)에 대해 올바른 주의 날짜들을 반환한다 */
  it('주의 시작(일요일)에 해당되는 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-05-11');
    const result = getWeekDates(date);

    assertDate(result[0], new Date('2025-05-11'));
    assertDate(result[1], new Date('2025-05-12'));
    assertDate(result[2], new Date('2025-05-13'));
    assertDate(result[3], new Date('2025-05-14'));
    assertDate(result[4], new Date('2025-05-15'));
    assertDate(result[5], new Date('2025-05-16'));
    assertDate(result[6], new Date('2025-05-17'));
  });

  /** @description 주의 끝(토요일)에 대해 올바른 주의 날짜들을 반환한다 */
  it('주의 끝(토요일)에 해당되는 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-05-17');
    const result = getWeekDates(date);

    assertDate(result[0], new Date('2025-05-11'));
    assertDate(result[1], new Date('2025-05-12'));
    assertDate(result[2], new Date('2025-05-13'));
    assertDate(result[3], new Date('2025-05-14'));
    assertDate(result[4], new Date('2025-05-15'));
    assertDate(result[5], new Date('2025-05-16'));
    assertDate(result[6], new Date('2025-05-17'));
  });

  /** @description 연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말) */
  it('연도를 넘어가는 주를 반환한다 (연말)', () => {
    const date = new Date('2025-12-31');
    const result = getWeekDates(date);

    assertDate(result[0], new Date('2025-12-28'));
    assertDate(result[1], new Date('2025-12-29'));
    assertDate(result[2], new Date('2025-12-30'));
    assertDate(result[3], new Date('2025-12-31'));
    assertDate(result[4], new Date('2026-01-01'));
    assertDate(result[5], new Date('2026-01-02'));
    assertDate(result[6], new Date('2026-01-03'));
  });

  /** @description 연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초) */
  it('연도를 넘어가는 주를 반환한다 (연초)', () => {
    const date = new Date('2025-01-01');
    const result = getWeekDates(date);

    assertDate(result[0], new Date('2024-12-29'));
    assertDate(result[1], new Date('2024-12-30'));
    assertDate(result[2], new Date('2024-12-31'));
    assertDate(result[3], new Date('2025-01-01'));
    assertDate(result[4], new Date('2025-01-02'));
    assertDate(result[5], new Date('2025-01-03'));
    assertDate(result[6], new Date('2025-01-04'));
  });

  /** @description 윤년의 2월 29일을 포함한 주를 올바르게 처리한다 */
  it('윤년의 2월 29일을 포함한 주를 반환한다', () => {
    const date = new Date('2024-02-29');
    const result = getWeekDates(date);

    assertDate(result[0], new Date('2024-02-25'));
    assertDate(result[1], new Date('2024-02-26'));
    assertDate(result[2], new Date('2024-02-27'));
    assertDate(result[3], new Date('2024-02-28'));
    assertDate(result[4], new Date('2024-02-29'));
    assertDate(result[5], new Date('2024-03-01'));
    assertDate(result[6], new Date('2024-03-02'));
  });

  /** @description 월의 마지막 날짜를 포함한 주를 올바르게 처리한다 */
  it('월의 마지막 날짜를 포함한 주를 반환한다', () => {
    const date = new Date('2025-05-31');
    const result = getWeekDates(date);

    assertDate(result[0], new Date('2025-05-25'));
    assertDate(result[1], new Date('2025-05-26'));
    assertDate(result[2], new Date('2025-05-27'));
    assertDate(result[3], new Date('2025-05-28'));
    assertDate(result[4], new Date('2025-05-29'));
    assertDate(result[5], new Date('2025-05-30'));
    assertDate(result[6], new Date('2025-05-31'));
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {});
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {});

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {});

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {});

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {});
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {});

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {});

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {});

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {});

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {});

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {});
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {});
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
