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
    const result = parseDateTime('2025_07_01', '14:30');
    expect(result.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '29:90');
    expect(result.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');
    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      category: '업무',
      date: '2025-05-20',
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A"',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };
    const result = convertEventToDateRange(event);
    expect(result.start).toEqual(new Date('2025-05-20T10:00:00'));
    expect(result.end).toEqual(new Date('2025-05-20T11:00:00'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      category: '업무',
      date: '2025_05_20',
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A"',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };
    const result = convertEventToDateRange(event);
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      category: '업무',
      date: '2025_05_20',
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      startTime: '15_00',
      endTime: '16_00',
      description: '주간 팀 미팅',
      location: '회의실 A"',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };
    const result = convertEventToDateRange(event);
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const eventOne: Event = {
      category: '업무',
      date: '2025-05-20',
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      startTime: '10:30',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A"',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };
    const eventTwo: Event = {
      category: '업무',
      date: '2025-05-20',
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      startTime: '10:00',
      endTime: '11:30',
      description: '주간 팀 미팅',
      location: '회의실 A"',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    const result = isOverlapping(eventOne, eventTwo);
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const eventOne: Event = {
      category: '업무',
      date: '2025-05-20',
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A"',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };
    const eventTwo: Event = {
      category: '업무',
      date: '2025-05-20',
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      startTime: '11:00',
      endTime: '12:30',
      description: '주간 팀 미팅',
      location: '회의실 A"',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    const result = isOverlapping(eventOne, eventTwo);
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const events: Event[] = [
    {
      category: '업무',
      date: '2025-05-20',
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A"',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      category: '개인',
      date: '2025-05-20',
      id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
      title: '팀 회의',
      startTime: '11:00',
      endTime: '12:30',
      description: '동료와 점심 식사',
      location: '회사 근처 식당"',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      category: '개인',
      date: '2025-05-30',
      id: '09702fb3-a478-40b3-905e-9ab3c8849dcdf',
      title: '팀 회의 하다가 인사하기',
      startTime: '12:30',
      endTime: '13:30',
      description: '지나가면서 신규에게 인사하기',
      location: '회사',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const event: Event = {
      category: '개인',
      date: '2025-05-20',
      id: '09702fb3-a478-40b3-905e-9ab3c8849asd',
      title: '팀 회의',
      startTime: '10:00',
      endTime: '12:00',
      description: '동료와 점심 식사',
      location: '회사 근처 식당"',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    const result = findOverlappingEvents(event, events);
    expect(result).toEqual([
      {
        category: '업무',
        date: '2025-05-20',
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '팀 회의',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A"',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        category: '개인',
        date: '2025-05-20',
        id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
        title: '팀 회의',
        startTime: '11:00',
        endTime: '12:30',
        description: '동료와 점심 식사',
        location: '회사 근처 식당"',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const event: Event = {
      category: '개인',
      date: '2025-05-20',
      id: '09702fb3-a478-40b3-905e-9ab3c8849asd',
      title: '팀 회의',
      startTime: '19:00',
      endTime: '20:00',
      description: '동료와 점심 식사',
      location: '회사 근처 식당"',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    const result = findOverlappingEvents(event, events);
    expect(result).toEqual([]);
  });
});
