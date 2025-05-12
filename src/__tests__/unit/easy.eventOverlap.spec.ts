import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = parseDateTime('2025-07-01', '14:30');
    expect(date).toEqual(new Date('2025-07-01 14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2025_07_01', '14:30');
    expect(date.toString()).toEqual('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2025-06-01', '14/30');
    expect(date.toString()).toEqual('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = parseDateTime('', '16:30');
    expect(date.toString()).toEqual('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      title: '팀 회의',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 1,
    };
    const { start, end } = convertEventToDateRange(event);
    expect(start).toEqual(new Date('2025-05-20 10:00:00'));
    expect(end).toEqual(new Date('2025-05-20 11:00:00'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '2',
      title: '팀 회의',
      date: '2025_06_20',
      startTime: '10:00',
      endTime: '11:00',
      description: '잘못됨',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 0,
    };
    const { start, end } = convertEventToDateRange(event);
    expect(start.toString()).toBe('Invalid Date');
    expect(end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '2',
      title: '팀 회의',
      date: '2025-06-20',
      startTime: '10/00',
      endTime: '11/00',
      description: '잘못됨',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 0,
    };
    const { start, end } = convertEventToDateRange(event);
    expect(start.toString()).toBe('Invalid Date');
    expect(end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '팀 회의1',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '12:00',
      description: '주간 팀 미팅1',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 1,
    };
    const event2: Event = {
      id: '2',
      title: '팀 회의2',
      date: '2025-05-20',
      startTime: '11:00',
      endTime: '12:00',
      description: '주간 팀 미팅2',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 1,
    };
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '팀 회의1',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '12:00',
      description: '주간 팀 미팅1',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 1,
    };
    const event2: Event = {
      id: '2',
      title: '팀 회의2',
      date: '2025-05-30',
      startTime: '11:00',
      endTime: '12:00',
      description: '주간 팀 미팅2',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 1,
    };
    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const existEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의1',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '12:00',
      description: '주간 팀 미팅1',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 1,
    },
    {
      id: '2',
      title: '팀 회의2',
      date: '2025-05-20',
      startTime: '14:00',
      endTime: '18:00',
      description: '주간 팀 미팅2',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 1,
    },
    {
      id: '3',
      title: '팀 회의3',
      date: '2025-05-22',
      startTime: '10:00',
      endTime: '13:00',
      description: '주간 팀 미팅3',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 1,
    },
  ];
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '4',
      title: '팀 회의4',
      date: '2025-05-20',
      startTime: '11:00',
      endTime: '15:00',
      description: '주간 팀 미팅3',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 1,
    };
    const result = findOverlappingEvents(newEvent, existEvents);
    expect(result).toEqual([existEvents[0], existEvents[1]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '5',
      title: '팀 회의5',
      date: '2025-05-21',
      startTime: '11:00',
      endTime: '15:00',
      description: '주간 팀 미팅5',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 1,
    };
    const result = findOverlappingEvents(newEvent, existEvents);
    expect(result).toEqual([]);
  });
});
