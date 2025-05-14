import { Event, EventForm } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

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
    const result = parseDateTime('2025-13-01', '14:30');
    expect(isNaN(result.getTime())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '25:00');
    expect(isNaN(result.getTime())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');
    expect(isNaN(result.getTime())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:30',
      description: '',
      location: '',
      category: '기타',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    const result = convertEventToDateRange(event);
    expect(result.start.getFullYear()).toBe(2025);
    expect(result.start.getHours()).toBe(9);
    expect(result.end.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '2',
      title: '잘못된 날짜 이벤트',
      date: '2025-13-01',
      startTime: '09:00',
      endTime: '10:30',
      description: '',
      location: '',
      category: '기타',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    const result = convertEventToDateRange(event);
    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '3',
      title: '잘못된 시간 이벤트',
      date: '2025-07-01',
      startTime: '25:00',
      endTime: '26:00',
      description: '',
      location: '',
      category: '기타',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    const result = convertEventToDateRange(event);
    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });
});

describe('isOverlapping', () => {
  const baseEvent: EventForm = {
    title: '기준 이벤트',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  };

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const overlappingEvent: EventForm = {
      ...baseEvent,
      title: '겹치는 이벤트',
      startTime: '10:30',
      endTime: '11:30',
    };

    expect(isOverlapping(baseEvent, overlappingEvent)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const nonOverlappingEvent: EventForm = {
      ...baseEvent,
      title: '겹치지 않는 이벤트',
      startTime: '11:00',
      endTime: '12:00',
    };

    expect(isOverlapping(baseEvent, nonOverlappingEvent)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const existingEvents: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '점심',
      date: '2025-07-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: EventForm = {
      title: '중간 회의',
      date: '2025-07-01',
      startTime: '10:30',
      endTime: '11:30',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    const overlapping = findOverlappingEvents(newEvent, existingEvents);
    expect(overlapping).toHaveLength(1);
    expect(overlapping[0].id).toBe('1');
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: EventForm = {
      title: '저녁 운동',
      date: '2025-07-01',
      startTime: '18:00',
      endTime: '19:00',
      description: '',
      location: '',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    const overlapping = findOverlappingEvents(newEvent, existingEvents);
    expect(overlapping).toEqual([]);
  });
});
