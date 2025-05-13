import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2025-07-01', '14:30')).toBeInstanceOf(Date);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const invalidDate = parseDateTime('a', '13:00');
    expect(invalidDate.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const invalidDate = parseDateTime('2025-07-01', 'aa');
    expect(invalidDate.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const invalidDate = parseDateTime('', '');
    expect(invalidDate.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: "2b7545a6-ebee-282c-203a-2329bc8d62bd",
      title: "월간 회의",
      date: "2025-05-01",
      startTime: "10:00",
      endTime: "11:00",
      description: "월간 팀 미팅",
      location: "회의실 A",
      category: "업무",
      repeat: { type: "none", interval: 0 },
      notificationTime: 1,
    };
    const { start, end } = convertEventToDateRange(event);
    expect(start).toEqual(new Date('2025-05-01T10:00'));
    expect(end).toEqual(new Date('2025-05-01T11:00'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: "2b7545a6-ebee-282c-203a-2329bc8d62bd",
      title: "잘못된 날짜 이벤트",
      date: "aa", // 잘못된 날짜
      startTime: "10:00",
      endTime: "11:00",
      description: "잘못된 날짜 형식",
      location: "회의실 A",
      category: "업무",
      repeat: { type: "none", interval: 0 },
      notificationTime: 1,
    };
    const { start, end } = convertEventToDateRange(event);
    expect(start.toString()).toBe('Invalid Date');
    expect(end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: "2b7545a6-ebee-282c-203a-2329bc8d62bd",
      title: "잘못된 날짜 이벤트",
      date: "2025-05-01",
      startTime: "a", // 잘못된 시간
      endTime: "b", // 잘못된 시간
      description: "잘못된 날짜 형식",
      location: "회의실 A",
      category: "업무",
      repeat: { type: "none", interval: 0 },
      notificationTime: 1,
    };
    const { start, end } = convertEventToDateRange(event);
    expect(start.toString()).toBe('Invalid Date');
    expect(end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const events: Event[] = [
      {
        id: "2b7545a6-ebee2-282c-203a-2329bc8d62bd",
        title: "같은 날짜 이벤트",
        date: "2025-05-01",
        startTime: "11:00",
        endTime: "12:00",
        description: "같은 날짜 형식",
        location: "회의실 A",
        category: "업무",
        repeat: { type: "none", interval: 0 },
        notificationTime: 1,
      },
      {
        id: "2b7545a6-ebee3-282c-203a-2329bc8d62bd",
        title: "같은 날짜 이벤트",
        date: "2025-05-01",
        startTime: "11:00",
        endTime: "12:00",
        description: "같은 날짜 형식",
        location: "회의실 A",
        category: "업무",
        repeat: { type: "none", interval: 0 },
        notificationTime: 1,
      }
    ];
    expect(isOverlapping(events[0], events[1])).toBeTruthy();
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const events: Event[] = [
      {
        id: "2b7545a6-ebee2-282c-203a-2329bc8d62bd",
        title: "다른 날짜 이벤트",
        date: "2025-05-01",
        startTime: "11:00",
        endTime: "12:00",
        description: "다른 날짜 형식",
        location: "회의실 A",
        category: "업무",
        repeat: { type: "none", interval: 0 },
        notificationTime: 1,
      },
      {
        id: "2b7545a6-ebee3-282c-203a-2329bc8d62bd",
        title: "다른 날짜 이벤트",
        date: "2025-05-01",
        startTime: "09:00",
        endTime: "11:00",
        description: "다른 날짜 형식",
        location: "회의실 A",
        category: "업무",
        repeat: { type: "none", interval: 0 },
        notificationTime: 1,
      }
    ];
    expect(isOverlapping(events[0], events[1])).toBeFalsy();
  });
});

describe('findOverlappingEvents', () => {
  const events: Event[] = [
    {
      id: "2b7545a6-ebee-282c-203a-2329bc8d62bd",
      title: "월간 회의",
      date: "2025-05-01",
      startTime: "10:00",
      endTime: "11:00",
      description: "월간 팀 미팅",
      location: "회의실 A",
      category: "업무",
      repeat: { type: "none", interval: 0 },
      notificationTime: 1,
    },
    {
      id: "2b7545a6-ebee-426c-b906-2329bc8d62bd",
      title: "팀 회의",
      date: "2025-05-20",
      startTime: "10:00",
      endTime: "11:00",
      description: "주간 팀 미팅",
      location: "회의실 A",
      category: "업무",
      repeat: { type: "none", interval: 0 },
      notificationTime: 1,
    },
    {
      id: "09702fb3-a478-40b3-905e-9ab3c8849dcd",
      title: "점심 약속",
      date: "2025-05-21",
      startTime: "12:30",
      endTime: "13:30",
      description: "동료와 점심 식사",
      location: "회사 근처 식당",
      category: "개인",
      repeat: { type: "none", interval: 0 },
      notificationTime: 1,
    }
  ];
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: "2b7545a6-ebee-282c-203a-233453453",
      title: "월간 회의",
      date: "2025-05-01",
      startTime: "10:30",
      endTime: "10:50",
      description: "월간 팀 미팅",
      location: "회의실 A",
      category: "업무",
      repeat: { type: "none", interval: 0 },
      notificationTime: 1,
    };
    const overlappingEvents = findOverlappingEvents(newEvent, events);
    expect(overlappingEvents).toEqual([{
      id: "2b7545a6-ebee-282c-203a-2329bc8d62bd",
      title: "월간 회의",
      date: "2025-05-01",
      startTime: "10:00",
      endTime: "11:00",
      description: "월간 팀 미팅",
      location: "회의실 A",
      category: "업무",
      repeat: { type: "none", interval: 0 },
      notificationTime: 1,
    }])
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: "2b7545a6-ebee-282c-203a-23345233453",
      title: "월간 회의",
      date: "2025-07-01",
      startTime: "10:30",
      endTime: "10:50",
      description: "월간 팀 미팅",
      location: "회의실 A",
      category: "업무",
      repeat: { type: "none", interval: 0 },
      notificationTime: 1,
    };
    const overlappingEvents = findOverlappingEvents(newEvent, events);
    expect(overlappingEvents).toEqual([])
  });
});
