import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import { createTestEvent } from '../../utils/testUtils';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-17-01', '14:30');
    expect(isNaN(result.getTime())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '99:99');
    expect(isNaN(result.getTime())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');
    expect(isNaN(result.getTime())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const input = createTestEvent();
    const result = convertEventToDateRange(input);

    expect(result.start.getFullYear()).toBe(2025);
    expect(result.start.getHours()).toBe(9);
    expect(result.end.getHours()).toBe(10);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const input = createTestEvent({ date: '2015-19-28' });
    const result = convertEventToDateRange(input);

    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const input = createTestEvent({ startTime: '99:99', endTime: '25:00' });
    const result = convertEventToDateRange(input);

    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = createTestEvent({ startTime: '10:00', endTime: '11:00' });
    const event2 = createTestEvent({ startTime: '10:30', endTime: '11:30' });

    const result = isOverlapping(event1, event2);
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = createTestEvent({ startTime: '09:00', endTime: '10:00' });
    const event2 = createTestEvent({ startTime: '10:00', endTime: '11:00' });

    const result = isOverlapping(event1, event2);
    expect(result).toBe(false);
  });

  it('첫 번째 이벤트의 종료 시간이 두 번째 이벤트의 시작 시간과 같으면 겹치지 않는다', () => {
    const e1 = createTestEvent({ startTime: '09:00', endTime: '10:00' });
    const e2 = createTestEvent({ startTime: '10:00', endTime: '11:00' });

    const result = isOverlapping(e1, e2);
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const existingEvents = [
      createTestEvent({ id: '1', startTime: '09:00', endTime: '10:30' }), // 겹침
      createTestEvent({ id: '2', startTime: '11:00', endTime: '12:00' }), // 겹치지 않음
      createTestEvent({ id: '3', startTime: '10:15', endTime: '10:45' }), // 겹침
    ];

    const newEvent = createTestEvent({
      id: 'new',
      startTime: '10:00',
      endTime: '11:00',
    });

    const result = findOverlappingEvents(newEvent, existingEvents);
    const resultIds = result.map((e) => e.id);

    expect(resultIds).toEqual(['1', '3']);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const existingEvents = [
      createTestEvent({ id: '1', startTime: '08:00', endTime: '09:00' }),
      createTestEvent({ id: '2', startTime: '11:00', endTime: '12:00' }),
    ];

    const newEvent = createTestEvent({
      id: 'new',
      startTime: '09:15',
      endTime: '09:45',
    });

    const result = findOverlappingEvents(newEvent, existingEvents);
    expect(result).toEqual([]);
  });
});
