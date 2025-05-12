import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  const date = '2025-07-01';
  const time = '14:30';
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime(date, time);

    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(6); // 0-based: 6 → 7월
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const errorDate = '2025:07:01'; // 잘못된 형식 (콜론 사용)

    const result = parseDateTime(errorDate, time);
    expect(isNaN(result.getDate())).toBe(true); // ✅ 유효하지 않은 날짜임을 확인
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const errorTime = '14-30';

    const result = parseDateTime(date, errorTime);
    expect(isNaN(result.getTime())).toBe(true); // ✅ 유효하지 않은 시간임을 확인
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const emptyDate = '';
    const result = parseDateTime(emptyDate, time);

    expect(isNaN(result.getDate())).toBe(true); // ✅ 빈 날짜임을 확인
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {});

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {});

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {});
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {});

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {});
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {});

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {});
});
