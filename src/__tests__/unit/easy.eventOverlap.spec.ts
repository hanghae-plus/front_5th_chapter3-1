import { Event, RepeatType } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = new Date('2025-07-01T14:30');
    expect(parseDateTime('2025-07-01', '14:30')).toEqual(date);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('12345', '14:30')).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-07-01', '11')).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '14:30')).toEqual(new Date('Invalid Date'));
  });
});

function makeEvent(id: string, updatedProperty: Partial<Event> = {}): Event {
  const defaultEvent = {
    id: id,
    title: `이벤트 ${id}`,
    date: formatDate(new Date()),
    startTime: '10:00',
    endTime: '11:00',
    description: `이벤트 ${id} 설명`,
    location: `이벤트 ${id} 장소`,
    category: `이벤트 ${id} 카테고리`,
    repeat: {
      type: 'none' as RepeatType,
      interval: 0,
    },
    notificationTime: 0,
  };
  return { ...defaultEvent, ...updatedProperty };
}

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const date = '2025-05-01';
    const startTime = '14:30';
    const endTime = '15:30';
    const expected = {
      start: parseDateTime(date, startTime),
      end: parseDateTime(date, endTime),
    };

    const event = makeEvent('1', { date, startTime, endTime });
    expect(convertEventToDateRange(event)).toEqual(expected);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const date = '123';
    const startTime = '14:30';
    const endTime = '15:30';
    const expected = {
      start: parseDateTime(date, startTime),
      end: parseDateTime(date, endTime),
    };

    const event = makeEvent('1', { date, startTime, endTime });
    expect(convertEventToDateRange(event)).toEqual(expected);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-05-01';
    const startTime = '1';
    const endTime = '2';
    const expected = {
      start: parseDateTime(date, startTime),
      end: parseDateTime(date, endTime),
    };

    const event = makeEvent('1', { date, startTime, endTime });
    expect(convertEventToDateRange(event)).toEqual(expected);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트의 기간이 겹치는 경우 true를 반환한다', () => {
    const event1 = makeEvent('1', { date: '2025-05-01', startTime: '14:30', endTime: '15:30' });
    const event2 = makeEvent('2', { date: '2025-05-01', startTime: '15:00', endTime: '16:00' });

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트의 기간이 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = makeEvent('1', { date: '2025-05-01', startTime: '14:30', endTime: '15:30' });
    const event2 = makeEvent('2', { date: '2025-05-01', startTime: '16:00', endTime: '17:00' });

    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 기간이 겹치는 모든 이벤트를 반환한다', () => {
    const currentEvent1 = makeEvent('1', {
      date: '2025-05-01',
      startTime: '15:30',
      endTime: '15:45',
    });
    const currentEvent2 = makeEvent('2', {
      date: '2025-05-01',
      startTime: '16:00',
      endTime: '16:30',
    });
    const currentEvent3 = makeEvent('3', {
      date: '2025-05-01',
      startTime: '16:30',
      endTime: '16:45',
    });
    // currentEvent1, currentEvent2와 겹치는 이벤트
    const newEvent = makeEvent('4', {
      date: '2025-05-01',
      startTime: '15:40',
      endTime: '16:20',
    });
    const events = [currentEvent1, currentEvent2, currentEvent3];
    expect(findOverlappingEvents(newEvent, events)).toEqual([currentEvent1, currentEvent2]);
  });

  it('새 이벤트와 기간이 겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const currentEvent1 = makeEvent('1', {
      date: '2025-05-02',
      startTime: '15:30',
      endTime: '15:45',
    });
    const currentEvent2 = makeEvent('2', {
      date: '2025-05-02',
      startTime: '16:00',
      endTime: '16:30',
    });
    const currentEvent3 = makeEvent('3', {
      date: '2025-05-02',
      startTime: '16:30',
      endTime: '16:45',
    });
    // currentEvent1, currentEvent2와 겹치는 이벤트
    const newEvent = makeEvent('4', {
      date: '2025-05-01',
      startTime: '15:40',
      endTime: '16:20',
    });
    const events = [currentEvent1, currentEvent2, currentEvent3];
    expect(findOverlappingEvents(newEvent, events)).toEqual([]);
  });
});
