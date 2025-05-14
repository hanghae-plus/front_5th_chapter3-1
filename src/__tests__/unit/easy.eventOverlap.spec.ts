import { dummyEvents } from '../../__mocks__/events';
import type { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = '2025-07-01';
    const time = '14:30';
    const parsedDate = parseDateTime(date, time);

    expect(parsedDate.toISOString()).toBe(new Date(`${date}T${time}`).toISOString());
  });

  it("날짜 형식이 'YYYY', 'YYYY-MM', 'YYYY-MM-DD'가 아닐 경우 Invalid Date를 반환한다", () => {
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
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = dummyEvents[0];
    const { date, startTime, endTime } = event;
    const convertedDateRange = convertEventToDateRange(event);

    expect(convertedDateRange.start.toISOString()).toBe(
      new Date(`${date}T${startTime}`).toISOString()
    );
    expect(convertedDateRange.end.toISOString()).toBe(new Date(`${date}T${endTime}`).toISOString());
  });

  it("이벤트 날짜 형식이 'YYYY', 'YYYY-MM', 'YYYY-MM-DD'가 아닌 경우 시작과 종료 시간이 Invalid Date인 객체로 변환한다", () => {
    const event = dummyEvents[0];
    const date = '2025-001';
    const convertedDateRange = convertEventToDateRange({ ...event, date });

    expect(convertedDateRange.start).toEqual(new Date(NaN));
    expect(convertedDateRange.end).toEqual(new Date(NaN));
  });

  it("이벤트 시작 시간 형식이 'hh:mm'나 'hh:mm:ss'가 아닌 경우 시작 시간이 Invalid Date인 객체로 변환한다", () => {
    const event = dummyEvents[0];
    const startTime = '12';
    const { date, endTime } = event;
    const convertedDateRange = convertEventToDateRange({ ...event, startTime });

    expect(convertedDateRange.start).toEqual(new Date(NaN));
    expect(convertedDateRange.end.toISOString()).toBe(new Date(`${date}T${endTime}`).toISOString());
  });
  it("이벤트 종료 시간 형식이 'hh:mm'나 'hh:mm:ss'가 아닌 경우 종료 시간이 Invalid Date인 객체로 변환한다", () => {
    const event = dummyEvents[0];
    const endTime = '14';
    const { date, startTime } = event;
    const convertedDateRange = convertEventToDateRange({ ...event, endTime });

    expect(convertedDateRange.start.toISOString()).toBe(
      new Date(`${date}T${startTime}`).toISOString()
    );
    expect(convertedDateRange.end).toEqual(new Date(NaN));
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {});

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {});
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {});

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {});
});
