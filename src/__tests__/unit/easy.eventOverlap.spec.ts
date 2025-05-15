import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../shared/lib/eventOverlap';
import { Event, EventForm } from '../../types';

describe('parseDateTime', () => {
  const date = '2025-07-01';
  const time = '14:30';
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime(date, time);

    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(6); // 0-based: 6 → 7월
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const errorDate = '2025:07:01'; // 잘못된 형식 (콜론 사용)

    const result = parseDateTime(errorDate, time);
    expect(isNaN(result.getDate())).toBe(true); // ✅ 유효하지 않은 날짜임을 확인
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const errorTime = '14-30';

    const result = parseDateTime(date, errorTime);
    expect(isNaN(result.getTime())).toBe(true); // ✅ 유효하지 않은 시간임을 확인
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const emptyDate = '';
    const result = parseDateTime(emptyDate, time);

    expect(isNaN(result.getDate())).toBe(true); // ✅ 빈 날짜임을 확인
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = {
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '16:00',
    } as EventForm;

    const result = convertEventToDateRange(event);

    expect(result.start.getFullYear()).toBe(2025);
    expect(result.start.getMonth()).toBe(6); // 0-indexed → 7월
    expect(result.start.getDate()).toBe(1);
    expect(result.start.getHours()).toBe(14);
    expect(result.start.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const badEvent = {
      date: 'banana',
      startTime: '14:30',
      endTime: '16:00',
    } as EventForm;

    const result = convertEventToDateRange(badEvent);

    expect(isNaN(result.start.getDate())).toBe(true);
    expect(isNaN(result.end.getDate())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const badEvent = {
      date: '2025-07-01',
      startTime: '14-30',
      endTime: '16-00',
    } as EventForm;

    const result = convertEventToDateRange(badEvent);

    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const eventFirst = {
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '16:00',
    } as EventForm;

    const eventSecound = {
      date: '2025-07-01', // ✅ 같은 날로 변경
      startTime: '14:30',
      endTime: '16:00',
    } as EventForm;

    const result = isOverlapping(eventFirst, eventSecound);

    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const eventFirst = {
      date: '2025-08-01',
      startTime: '14:30',
      endTime: '16:00',
    } as EventForm;

    const eventSecound = {
      date: '2025-07-01', // ✅ 같은 날로 변경
      startTime: '14:30',
      endTime: '16:00',
    } as EventForm;

    const result = isOverlapping(eventFirst, eventSecound);

    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const newEvent: Event = {
    id: 'new',
    date: '2025-07-01',
    startTime: '14:00',
    endTime: '15:00',
    title: '',
    description: '',
    location: '',
    category: '',
    repeat: undefined,
    notificationTime: 0,
  };

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const existingEvents: Event[] = [
      {
        id: '1',
        date: '2025-07-01',
        startTime: '13:30',
        endTime: '14:30', // ✅ 겹침
        title: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
      {
        id: '2',
        date: '2025-07-01',
        startTime: '15:00',
        endTime: '16:00', // ❌ 겹치지 않음 (끝과 시작이 같음)
        title: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
      {
        id: '3',
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30', // ✅ 겹침
        title: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
      {
        id: 'new',
        date: '2025-07-01',
        startTime: '14:00',
        endTime: '15:00', // ❌ 자기 자신 → 제외
        title: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
    ];

    const result = findOverlappingEvents(newEvent, existingEvents);

    expect(result.map((e) => e.id)).toEqual(['1', '3']); // ✅ 겹치는 이벤트만 포함
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const existingEvents: Event[] = [
      {
        id: '1',
        date: '2025-07-01',
        startTime: '12:00',
        endTime: '13:00', // ❌ newEvent(14:00~15:00)와 겹치지 않음
        title: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
      {
        id: '2',
        date: '2025-07-01',
        startTime: '15:00',
        endTime: '16:00', // ❌ 딱 끝나는 시점 → 안 겹침
        title: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
      {
        id: '3',
        date: '2025-07-01',
        startTime: '10:30',
        endTime: '12:30', // ✅ 겹침
        title: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
    ];

    const result = findOverlappingEvents(newEvent, existingEvents);

    expect(result.map((e) => e.id)).toEqual([]); // ✅ 겹치는 이벤트가 없으면 빈배열
  });
});
