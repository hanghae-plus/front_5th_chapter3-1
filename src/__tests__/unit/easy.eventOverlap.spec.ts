import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = parseDateTime('2026-03-15', '13:45');
    expect(date).toEqual(new Date('2026-03-15T13:45:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2026-03-55', '13:45');
    expect(date).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2026-03-15', '25:70');
    expect(date).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = parseDateTime('', '13:45');
    expect(date).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  const testEvent: Event = {
    id: 'e001',
    title: '프로젝트 회의',
    date: '2026-03-15',
    startTime: '13:00',
    endTime: '14:30',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none' as const, interval: 0 },
    notificationTime: 0,
  };
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(testEvent);
    expect(result.start).toEqual(new Date('2026-03-15T13:00:00'));
    expect(result.end).toEqual(new Date('2026-03-15T14:30:00'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidDateEvent: Event = {
      ...testEvent,
      date: '2026-03-55',
    };
    const result = convertEventToDateRange(invalidDateEvent);
    expect(result.start).toEqual(new Date('Invalid Date'));
    expect(result.end).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidTimeEvent: Event = {
      ...testEvent,
      startTime: '25:10',
      endTime: '26:10',
    };
    const result = convertEventToDateRange(invalidTimeEvent);
    expect(result.start).toEqual(new Date('Invalid Date'));
    expect(result.end).toEqual(new Date('Invalid Date'));
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: 'e001',
      title: '팀 미팅',
      date: '2026-03-15',
      startTime: '13:00',
      endTime: '14:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    };
    const event2: Event = {
      id: 'e002',
      title: '점심 식사',
      date: '2026-03-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    };
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: 'e001',
      title: '팀 미팅',
      date: '2026-03-15',
      startTime: '13:00',
      endTime: '14:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    };
    const event2: Event = {
      id: 'e002',
      title: '점심 식사',
      date: '2026-03-15',
      startTime: '15:00',
      endTime: '16:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    };
    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const events: Event[] = [
    {
      id: 'e002',
      title: '점심 식사',
      date: '2026-03-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    },
    {
      id: 'e003',
      title: '개발 스프린트',
      date: '2026-03-15',
      startTime: '15:00',
      endTime: '16:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    },
  ];
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: 'e001',
      title: '팀 미팅',
      date: '2026-03-15',
      startTime: '13:00',
      endTime: '14:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    };
    const overlappingEvents = findOverlappingEvents(newEvent, events);
    expect(overlappingEvents.length).toBe(1);
    expect(overlappingEvents[0].id).toBe('e002');
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: 'e001',
      title: '팀 미팅',
      date: '2026-03-15',
      startTime: '17:00',
      endTime: '18:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    };
    const overlappingEvents = findOverlappingEvents(newEvent, events);
    expect(overlappingEvents.length).toBe(0);
  });
});
