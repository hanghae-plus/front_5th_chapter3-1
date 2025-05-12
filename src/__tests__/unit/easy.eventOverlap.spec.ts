import { Event, EventForm } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = parseDateTime('2025-05-12', '14:30');
    expect(date).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('20250512', '143:0');
    expect(date).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2025-05-12', '143:0');
    expect(date).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = parseDateTime('', '14:30');
    expect(date).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: EventForm = {
      title: '도서관 가기!',
      date: '2025-05-12',
      startTime: '16:00',
      endTime: '17:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const dateRange = convertEventToDateRange(event);
    expect(dateRange).toEqual({
      start: new Date('2025-05-12T16:00:00'),
      end: new Date('2025-05-12T17:00:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: EventForm = {
      title: '도서관 가기!',
      date: '2025-0512',
      startTime: '16:00',
      endTime: '17:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const dateRange = convertEventToDateRange(event);
    expect(dateRange).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: EventForm = {
      title: '도서관 가기!',
      date: '2025-05-12',
      startTime: '160000',
      endTime: '170000',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const dateRange = convertEventToDateRange(event);
    expect(dateRange).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: EventForm = {
      title: '도서관 가기!',
      date: '2025-05-12',
      startTime: '16:00',
      endTime: '17:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const event2: EventForm = {
      title: '장보기!',
      date: '2025-05-12',
      startTime: '16:00',
      endTime: '17:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const result = isOverlapping(event1, event2);
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: EventForm = {
      title: '도서관 가기!',
      date: '2025-05-12',
      startTime: '16:00',
      endTime: '17:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const event2: EventForm = {
      title: '장보기!',
      date: '2025-05-13',
      startTime: '16:00',
      endTime: '17:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const result = isOverlapping(event1, event2);
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: EventForm = {
      title: '롯데월드 가기!',
      date: '2025-05-15',
      startTime: '16:30',
      endTime: '17:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const events: Event[] = [
      {
        id: '1',
        title: '도서관 가기!',
        date: '2025-05-12',
        startTime: '16:00',
        endTime: '17:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '친구 집 가기!',
        date: '2025-05-13',
        startTime: '16:00',
        endTime: '17:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '3',
        title: '설명회 가기!',
        date: '2025-05-15',
        startTime: '13:00',
        endTime: '17:30',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '4',
        title: '장보기!',
        date: '2025-05-15',
        startTime: '16:00',
        endTime: '17:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const result = findOverlappingEvents(newEvent, events);
    expect(result).toEqual([
      {
        id: '3',
        title: '설명회 가기!',
        date: '2025-05-15',
        startTime: '13:00',
        endTime: '17:30',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '4',
        title: '장보기!',
        date: '2025-05-15',
        startTime: '16:00',
        endTime: '17:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: EventForm = {
      title: '롯데월드 가기!',
      date: '2025-06-15',
      startTime: '16:30',
      endTime: '17:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const events: Event[] = [
      {
        id: '1',
        title: '도서관 가기!',
        date: '2025-05-12',
        startTime: '16:00',
        endTime: '17:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '친구 집 가기!',
        date: '2025-05-13',
        startTime: '16:00',
        endTime: '17:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '3',
        title: '설명회 가기!',
        date: '2025-05-15',
        startTime: '13:00',
        endTime: '17:30',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '4',
        title: '장보기!',
        date: '2025-05-15',
        startTime: '16:00',
        endTime: '17:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const result = findOverlappingEvents(newEvent, events);
    expect(result).toEqual([]);
  });
});
