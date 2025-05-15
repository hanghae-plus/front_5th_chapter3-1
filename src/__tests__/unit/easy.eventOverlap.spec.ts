import { Event, RepeatType } from '../../types';
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
    const result = parseDateTime(date, time);
    
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(6); // 0-based month index (7월은 6)
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = 'invalid-date';
    const time = '14:30';
    const result = parseDateTime(date, time);
    
    expect(isNaN(result.getTime())).toBe(true); // Invalid Date 확인 방법
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-01';
    const time = 'invalid-time';
    const result = parseDateTime(date, time);
    
    expect(isNaN(result.getTime())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '');
    expect(isNaN(result.getTime())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      title: '미팅',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    };
    
    const dateRange = convertEventToDateRange(event);
    
    // 시작 시간 확인
    expect(dateRange.start).toBeInstanceOf(Date);
    expect(dateRange.start.getHours()).toBe(10);
    expect(dateRange.start.getMinutes()).toBe(0);
    
    // 종료 시간 확인
    expect(dateRange.end).toBeInstanceOf(Date);
    expect(dateRange.end.getHours()).toBe(11);
    expect(dateRange.end.getMinutes()).toBe(0);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = {
      id: '1',
      title: '미팅',
      date: 'invalid-date',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    } as Event;
    
    const dateRange = convertEventToDateRange(event);
    
    expect(isNaN(dateRange.start.getTime())).toBe(true);
    expect(isNaN(dateRange.end.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = {
      id: '1',
      title: '미팅',
      date: '2025-07-01',
      startTime: 'invalid-time',
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    } as Event;
    
    const dateRange = convertEventToDateRange(event);
    
    expect(isNaN(dateRange.start.getTime())).toBe(true);
    expect(isNaN(dateRange.end.getTime())).toBe(false); // 종료 시간은 유효
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '미팅 1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:30',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    };
    
    const event2: Event = {
      id: '2',
      title: '미팅 2',
      date: '2025-07-01',
      startTime: '11:00', // 겹치는 시간
      endTime: '12:00',
      description: '팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    };
    
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '미팅 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00', // 겹치지 않음
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    };
    
    const event2: Event = {
      id: '2',
      title: '미팅 2',
      date: '2025-07-01',
      startTime: '10:00', // 첫 번째 이벤트가 끝나는 시점에 시작
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    };
    
    expect(isOverlapping(event1, event2)).toBe(false);
  });
  
  it('서로 다른 날짜의 이벤트에 대해 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '미팅 1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    };
    
    const event2: Event = {
      id: '2',
      title: '미팅 2',
      date: '2025-07-02', // 다른 날짜
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    };
    
    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const existingEvents: Event[] = [
    {
      id: '1',
      title: '회의 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '아침 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '회의 2',
      date: '2025-07-01',
      startTime: '10:30',
      endTime: '11:30',
      description: '중간 회의',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '회의 3',
      date: '2025-07-01',
      startTime: '13:00',
      endTime: '14:00',
      description: '오후 회의',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    },
    {
      id: '4',
      title: '회의 4',
      date: '2025-07-02', // 다른 날짜
      startTime: '10:00',
      endTime: '11:00',
      description: '다음날 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '5',
      title: '새 회의',
      date: '2025-07-01',
      startTime: '10:00', // 회의 2와 겹침
      endTime: '11:00',
      description: '새로운 회의',
      location: '회의실 D',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    };
    
    const overlappingEvents = findOverlappingEvents(newEvent, existingEvents);
    
    expect(overlappingEvents.length).toBe(1);
    expect(overlappingEvents[0].id).toBe('2');
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '5',
      title: '새 회의',
      date: '2025-07-01',
      startTime: '11:45', // 어떤 회의와도 겹치지 않음
      endTime: '12:45',
      description: '새로운 회의',
      location: '회의실 D',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    };
    
    const overlappingEvents = findOverlappingEvents(newEvent, existingEvents);
    
    expect(overlappingEvents.length).toBe(0);
  });
  
  it('기존 이벤트 중 자신의 ID와 동일한 이벤트는 제외한다', () => {
    const updatedEvent: Event = {
      id: '2', // 기존 이벤트와 동일한 ID
      title: '회의 2 수정',
      date: '2025-07-01',
      startTime: '10:30', // 원래 시간과 동일
      endTime: '11:30',
      description: '업데이트된 회의',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    };
    
    const overlappingEvents = findOverlappingEvents(updatedEvent, existingEvents);
    
    expect(overlappingEvents.length).toBe(0); // 자신의 ID는 제외되므로 0
  });
});
