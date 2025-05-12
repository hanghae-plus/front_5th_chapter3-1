import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import dummyEvents from '../dummy/dummyEventsMonth.json' assert { type: 'json' };

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');
    expect(result).toBeInstanceOf(Date);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('202-01', '14:30');

    // toString() 메서드를 사용하여 'Invalid Date' 문자열 확인
    expect(result.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '14:3021230');

    expect(result.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');

    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(dummyEvents.events[0] as Event);
    expect(result).toEqual({
      start: new Date('2025-11-03T10:00:00'),
      end: new Date('2025-11-03T11:30:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange({
      date: '2025-3',
      startTime: '10:00',
      endTime: '11:30',
    } as Event);

    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange({
      date: '2025-11-03',
      startTime: '1012321300',
      endTime: '11:3021230',
    } as Event);

    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const result = isOverlapping(dummyEvents.events[0] as Event, dummyEvents.events[0] as Event);
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const result = isOverlapping(dummyEvents.events[0] as Event, dummyEvents.events[1] as Event);
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent = {
      id: 'MONTHLY001',
      title: '11월 첫째 주 주간회의 (월간 테스트용)',
      description: '11월 프로젝트 진행상황 점검',
      location: '1번 회의실',
      date: '2025-11-01',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    } as Event;

    const result = findOverlappingEvents(newEvent, dummyEvents.events as Event[]);

    expect(result).toEqual([dummyEvents.events[0]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {});
});
