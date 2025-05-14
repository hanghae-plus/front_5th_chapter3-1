import realEvents from '../../__mocks__/response/realEvents.json';
import type { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const parsedDate = parseDateTime('2025-07-01', '14:30');

    expect(parsedDate.toISOString()).toBe(new Date('2025-07-01T$14:30').toISOString());
  });

  it("날짜 형식이 'YYYY', 'YYYY-MM', 'YYYY-MM-DD'가 아닐 경우 Invalid Date를 반환한다", () => {
    expect(parseDateTime('20-212', '14:30')).toEqual(new Date(NaN));
  });

  it("시간 형식이 'hh:mm'나 'hh:mm:ss'가 아닐 경우 Invalid Date를 반환한다", () => {
    expect(parseDateTime('2025-12-01', '14')).toEqual(new Date(NaN));
    expect(parseDateTime('2025-12-01', '14-30-01')).toEqual(new Date(NaN));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '14:30')).toEqual(new Date(NaN));
  });

  it('시간 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-12-01', '')).toEqual(new Date(NaN));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };
    const convertedDateRange = convertEventToDateRange(event);

    expect(convertedDateRange.start.toISOString()).toBe(new Date('2025-05-20T10:00').toISOString());
    expect(convertedDateRange.end.toISOString()).toBe(new Date('2025-05-20T11:00').toISOString());
  });

  it("이벤트 날짜 형식이 'YYYY', 'YYYY-MM', 'YYYY-MM-DD'가 아닌 경우 시작과 종료 시간이 Invalid Date인 객체로 변환한다", () => {
    const event: Event = {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-001',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };
    const convertedDateRange = convertEventToDateRange(event);

    expect(convertedDateRange.start).toEqual(new Date(NaN));
    expect(convertedDateRange.end).toEqual(new Date(NaN));
  });

  it("이벤트 시작 시간 형식이 'hh:mm'나 'hh:mm:ss'가 아닌 경우 시작 시간이 Invalid Date인 객체로 변환한다", () => {
    const event: Event = {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-01-01',
      startTime: '12',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };
    const convertedDateRange = convertEventToDateRange(event);

    expect(convertedDateRange.start).toEqual(new Date(NaN));
    expect(convertedDateRange.end.toISOString()).toBe(new Date('2025-01-01T11:00').toISOString());
  });
  it("이벤트 종료 시간 형식이 'hh:mm'나 'hh:mm:ss'가 아닌 경우 종료 시간이 Invalid Date인 객체로 변환한다", () => {
    const event: Event = {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-01-01',
      startTime: '11:00',
      endTime: '14',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };
    const convertedDateRange = convertEventToDateRange(event);

    expect(convertedDateRange.start.toISOString()).toBe(new Date('2025-01-01T11:00').toISOString());
    expect(convertedDateRange.end).toEqual(new Date(NaN));
  });
});

describe('isOverlapping', () => {
  it('한 이벤트가 다른 이벤트의 시간 범위에 완전히 포함되면 true를 반환한다', () => {
    const firstEvent: Event = {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-01-01',
      startTime: '11:30',
      endTime: '15:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };
    const secondEvent: Event = {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-01-01',
      startTime: '12:30',
      endTime: '14:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    expect(isOverlapping(firstEvent, secondEvent)).toBeTruthy();
  });

  it('두 이벤트의 시간이 겹치기만 해도 true를 반환한다', () => {
    const firstEvent: Event = {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-01-01',
      startTime: '11:30',
      endTime: '15:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };
    const secondEvent: Event = {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-01-01',
      startTime: '13:30',
      endTime: '16:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    expect(isOverlapping(firstEvent, secondEvent)).toBeTruthy();
  });

  it('두 이벤트의 시간이 겹치지 않는 경우 false를 반환한다', () => {
    const firstEvent: Event = {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-01-01',
      startTime: '11:30',
      endTime: '15:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };
    const secondEvent: Event = {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-02-01',
      startTime: '13:30',
      endTime: '16:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    expect(isOverlapping(firstEvent, secondEvent)).toBeFalsy();
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '8',
      title: '이벤트 8',
      date: '2025-05-10',
      startTime: '17:00',
      endTime: '22:00',
      description: '설명',
      location: '장소',
      category: '카테고리',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    };

    expect(findOverlappingEvents(newEvent, realEvents.events as Event[])).toEqual([
      expect.objectContaining({ date: '2025-05-10', startTime: '17:10', endTime: '19:09' }),
      expect.objectContaining({ date: '2025-05-10', startTime: '17:10', endTime: '18:10' }),
    ]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '8',
      title: '이벤트 8',
      date: '2025-10-01',
      startTime: '11:30',
      endTime: '17:00',
      description: '설명',
      location: '장소',
      category: '카테고리',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    };

    expect(findOverlappingEvents(newEvent, realEvents.events as Event[])).toHaveLength(0);
  });
});
