import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');
    expect(result).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');
    expect(result).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');
    expect(result).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');
    expect(result).toEqual(new Date('Invalid Date'));
  });
});

const events: Event[] = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2024-07-01',
    startTime: '14:30',
    endTime: '15:30',
    description: '설명',
    location: '장소',
    category: '테고리',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 5,
  },
];
describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(events[0]);
    expect(result).toEqual({
      start: new Date('2024-07-01T14:30:00'),
      end: new Date('2024-07-01T15:30:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange({
      ...events[0],
      date: '1111-17-51',
    });

    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange({
      ...events[0],
      startTime: '55:55',
      endTime: '77:77',
    });
    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '14:30',
        endTime: '15:30',
        description: '설명',
        location: '장소',
        category: '테고리',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 5,
      },
      {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '14:30',
        endTime: '15:30',
        description: '설명',
        location: '장소',
        category: '테고리',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 5,
      },
    ];
    const result = isOverlapping(events[0], events[1]);

    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '14:30',
        endTime: '15:30',
        description: '설명',
        location: '장소',
        category: '테고리',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 5,
      },
      {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '15:30',
        endTime: '16:30',
        description: '설명',
        location: '장소',
        category: '테고리',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 5,
      },
    ];
    const result = isOverlapping(events[0], events[1]);
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    // 기존 이벤트 배열
    const existingEvents: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '14:00',
        endTime: '15:00',
        description: '설명1',
        location: '장소1',
        category: '카테고리1',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 5,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2024-07-01',
        startTime: '15:30',
        endTime: '16:30',
        description: '설명2',
        location: '장소2',
        category: '카테고리2',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 5,
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2024-07-02',
        startTime: '14:30',
        endTime: '15:15',
        description: '설명3',
        location: '장소3',
        category: '카테고리3',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 5,
      },
    ];

    // 새 이벤트
    const newEvent: Event = {
      id: '4',
      title: '새 이벤트',
      date: '2024-07-01',
      startTime: '14:45',
      endTime: '15:45',
      description: '설명4',
      location: '장소4',
      category: '카테고리4',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 5,
    };
    // 함수 실행
    const result = findOverlappingEvents(newEvent, existingEvents);

    // 결과 검증: 이벤트 1과 3이 새 이벤트와 겹칩니다
    expect(result).toEqual([existingEvents[0], existingEvents[1]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    // 기존 이벤트 배열
    const existingEvents: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-02',
        startTime: '14:00',
        endTime: '15:00',
        description: '설명1',
        location: '장소1',
        category: '카테고리1',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 5,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2024-07-02',
        startTime: '15:30',
        endTime: '16:30',
        description: '설명2',
        location: '장소2',
        category: '카테고리2',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 5,
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2024-07-02',
        startTime: '14:30',
        endTime: '15:15',
        description: '설명3',
        location: '장소3',
        category: '카테고리3',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 5,
      },
    ];

    // 새 이벤트
    const newEvent: Event = {
      id: '4',
      title: '새 이벤트',
      date: '2024-07-01',
      startTime: '14:45',
      endTime: '15:45',
      description: '설명4',
      location: '장소4',
      category: '카테고리4',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 5,
    };
    // 함수 실행
    const result = findOverlappingEvents(newEvent, existingEvents);

    expect(result).toEqual([]);
  });
});
