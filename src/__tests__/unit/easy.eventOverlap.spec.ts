import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

const events: Event[] = [
  {
    id: '1',
    date: '2025-07-01',
    startTime: '14:30',
    endTime: '15:30',
    title: 'test',
    description: 'test',
    location: 'test',
    category: 'test',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  },
  {
    id: '2',
    date: '2025-07-01',
    startTime: '15:30',
    endTime: '16:30',
    title: 'test',
    description: 'test',
    location: 'test',
    category: 'test',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  },
];

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');
    expect(result).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-abcd', '14:30');
    expect(result).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30:60');
    expect(result).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');
    expect(result).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange({
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      title: 'test',
      description: 'test',
      location: 'test',
      category: 'test',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    });
    expect(result).toEqual({
      start: new Date('2025-07-01T14:30:00'),
      end: new Date('2025-07-01T15:30:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange({
      date: '2025-07-abcd',
      startTime: '14:30',
      endTime: '15:30',
      title: 'test',
      description: 'test',
      location: 'test',
      category: 'test',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    });
    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange({
      date: '2025-07-01',
      startTime: '14:30:60',
      endTime: '15:30:60',
      title: 'test',
      description: 'test',
      location: 'test',
      category: 'test',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    });
    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const result = isOverlapping(
      {
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30',
        title: 'test',
        description: 'test',
        location: 'test',
        category: 'test',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
      {
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30',
        title: 'test',
        description: 'test',
        location: 'test',
        category: 'test',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      }
    );
    expect(result).toEqual(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const result = isOverlapping(
      {
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30',
        title: 'test',
        description: 'test',
        location: 'test',
        category: 'test',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
      {
        date: '2025-07-01',
        startTime: '15:30',
        endTime: '16:30',
        title: 'test',
        description: 'test',
        location: 'test',
        category: 'test',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      }
    );
    expect(result).toEqual(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const result = findOverlappingEvents(
      {
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30',
        title: 'test',
        description: 'test',
        location: 'test',
        category: 'test',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
      events
    );
    expect(result).toEqual([
      {
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30',
        id: '1',
        title: 'test',
        description: 'test',
        location: 'test',
        category: 'test',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
    ]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const result = findOverlappingEvents(
      {
        date: '2025-06-01',
        startTime: '14:30',
        endTime: '15:30',
        title: 'test',
        description: 'test',
        location: 'test',
        category: 'test',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
      events
    );

    expect(result).toEqual([]);
  });
});
