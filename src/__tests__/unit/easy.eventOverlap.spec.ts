import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const parsedDate = parseDateTime('2025-07-01', '14:30');

    expect(parsedDate.getFullYear()).toBe(2025);
    expect(parsedDate.getMonth()).toBe(6);
    expect(parsedDate.getDate()).toBe(1);
    expect(parsedDate.getHours()).toBe(14);
    expect(parsedDate.getMinutes()).toBe(30);
  });

  it("날짜 형식이 'YYYY-MM-DD'가 아닐 경우 Invalid Date를 반환한다", () => {
    expect(parseDateTime('20-212', '14:30')).toEqual(new Date(NaN));
  });

  it("시간 형식이 'hh:mm'나 'hh:mm:ss'가 아닐 경우 Invalid Date를 반환한다", () => {
    expect(parseDateTime('2025-12-01', '14')).toEqual(new Date(NaN));
    expect(parseDateTime('2025-12-01', '14-30-01')).toEqual(new Date(NaN));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '14:30')).toEqual(new Date(NaN));
  });

  it('시간 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-12-01', '')).toEqual(new Date(NaN));
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
