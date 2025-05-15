import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import { createTestEvent } from '../helpers/event';
describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');

    const expected = new Date('2025-07-01T14:30');
    expect(result).toEqual(expected);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('20251301', '14:30');

    expect(result.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '25+30');

    expect(result.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');

    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = createTestEvent({
      id: '1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:30',
    });

    const { start, end } = convertEventToDateRange(event);

    expect(start).toEqual(new Date('2025-07-01T09:00'));
    expect(end).toEqual(new Date('2025-07-01T10:30'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = createTestEvent({
      id: '1',
      date: '20251301',
      startTime: '09:00',
      endTime: '10:30',
    });

    const { start, end } = convertEventToDateRange(event);

    expect(start.toString()).toBe('Invalid Date');
    expect(end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = createTestEvent({
      id: '1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '24+30',
    });

    const { start, end } = convertEventToDateRange(event);

    expect(start).toEqual(new Date('2025-07-01T09:00'));
    expect(end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트의 시간과 날짜가 겹치는 경우 true를 반환한다', () => {
    const event1 = createTestEvent({
      id: '1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '11:00',
    });

    const event2 = createTestEvent({
      id: '2',
      date: '2025-07-01',
      startTime: '10:30',
      endTime: '12:00',
    });

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트의 시간이 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = createTestEvent({
      id: '1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
    });

    const event2 = createTestEvent({
      id: '2',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
    });

    expect(isOverlapping(event1, event2)).toBe(false);
  });

  it('두 이벤트의 날짜가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = createTestEvent({
      id: '1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
    });

    const event2 = createTestEvent({
      id: '2',
      date: '2025-07-02',
      startTime: '09:00',
      endTime: '10:00',
    });

    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const events = [
    createTestEvent({
      id: '1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
    }),
    createTestEvent({
      id: '2',
      date: '2025-07-01',
      startTime: '12:00',
      endTime: '13:00',
    }),
    createTestEvent({
      id: '3',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '15:30',
    }),
    createTestEvent({
      id: '4',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '15:30',
    }),
    createTestEvent({
      id: '5',
      date: '2025-07-02',
      startTime: '10:00',
      endTime: '11:00',
    }),
    createTestEvent({
      id: '6',
      date: '2025-07-02',
      startTime: '10:00',
      endTime: '11:00',
    }),
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent = createTestEvent({
      id: '7',
      date: '2025-07-01',
      startTime: '09:30',
      endTime: '14:30',
    });

    const overlaps = findOverlappingEvents(newEvent, events);

    expect(overlaps).toHaveLength(4);
    expect(overlaps.map((e) => e.id)).toEqual(['1', '2', '3', '4']);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent = createTestEvent({
      id: '7',
      date: '2025-07-01',
      startTime: '18:00',
      endTime: '19:00',
    });

    const overlaps = findOverlappingEvents(newEvent, events);

    expect(overlaps).toHaveLength(0);
  });

  it('기존 이벤트를 업데이트할 때 자기 자신은 제외한다', () => {
    const updatedEvent = createTestEvent({
      id: '1',
      date: '2025-07-01',
      startTime: '08:30',
      endTime: '10:30',
    });

    const overlaps = findOverlappingEvents(updatedEvent, events);

    expect(overlaps).toHaveLength(0);
  });
});
