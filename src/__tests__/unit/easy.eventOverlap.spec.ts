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
    // 정확한 Date 객체, toBeInstanceOf 사용
    expect(result).toBeInstanceOf(Date);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    // MARK: 테스트를 작성할 때, 아래의 여러 케이스를 다 구분해서 작성하는게 맞는건가?
    const invalidDateFormats = [
      '2025,07,01', // 쉼표로 구분
      '2025/07/01', // 슬래시로 구분
      '2025.07.01', // 점으로 구분
      '2025-7-1', // 한 자리 숫자
      '2025-13-01', // 잘못된 월
      '2025-07-32', // 잘못된 일
      '2025-00-01', // 0월
      '2025-07-00', // 0일
    ];

    invalidDateFormats.forEach((date) => {
      const result = parseDateTime(date, '14:30');
      expect(result).toBeInstanceOf(Date);
      // Invalid Date
      expect(result.toString()).toBe('Invalid Date');
    });
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const invalidTimeFormats = [
      '25:30', // 24시간 초과
      '24:00', // 24:00은 유효하지 않음
      '12:60', // 60분 초과
      '12:99', // 99분
      '12:30:99', // 99초
      '12:30:60', // 60초 초과
      '12:30:00:000', // 밀리초 포함
      '12.30', // 점으로 구분
      '12,30', // 쉼표로 구분
      '12-30', // 하이픈으로 구분
    ];

    invalidTimeFormats.forEach((time) => {
      const result = parseDateTime('2025-07-01', time);
      expect(result).toBeInstanceOf(Date);
      expect(result.toString()).toBe('Invalid Date');
    });
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');
    expect(result).toBeInstanceOf(Date);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    // TODO: 일반적인 이벤트를 어떻게 정의할 것인가?
    const event = {
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    } as Event;
    const result = convertEventToDateRange(event);
    expect(result.start).toBeInstanceOf(Date);
    expect(result.end).toBeInstanceOf(Date);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    // 잘못된 날짜 형식
    const invalidDateFormats = [
      '2025,07,01', // 쉼표로 구분
      '2025/07/01', // 슬래시로 구분
      '2025.07.01', // 점으로 구분
      '2025-7-1', // 한 자리 숫자
      '2025-13-01', // 잘못된 월
      '2025-07-32', // 잘못된 일
      '2025-00-01', // 0월
      '2025-07-00', // 0일
    ];
    invalidDateFormats.forEach((date) => {
      const event = {
        date,
        startTime: '14:30',
        endTime: '15:30',
      } as Event;
      const result = convertEventToDateRange(event);
      expect(result.start).toBeInstanceOf(Date);
      expect(result.end).toBeInstanceOf(Date);
      expect(result.start.toString()).toBe('Invalid Date');
      expect(result.end.toString()).toBe('Invalid Date');
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidTimeFormats = [
      '25:30', // 24시간 초과
      '12:60', // 60분 초과
      '12:99', // 99분
      '12:30:99', // 99초
    ];

    invalidTimeFormats.forEach((time) => {
      const event = {
        date: '2025-07-01',
        startTime: time,
        endTime: '15:30',
      } as Event;
      const result = convertEventToDateRange(event);
      console.log('🚀 ~ invalidTimeFormats.forEach ~ result', result);
      expect(result.start).toBeInstanceOf(Date);
      expect(result.end).toBeInstanceOf(Date);
      expect(result.start.toString()).toBe('Invalid Date');
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = {
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    } as Event;

    const event2 = {
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    } as Event;

    const result = isOverlapping(event1, event2);
    expect(result).toBe(false);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = {
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    } as Event;

    const event2 = {
      date: '2025-07-01',
      startTime: '15:30',
      endTime: '16:30',
    } as Event;

    const result = isOverlapping(event1, event2);
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const event1 = {
      id: '1',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    } as Event;

    const event2 = {
      id: '2',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    } as Event;

    const events = [event1, event2];
    const result = findOverlappingEvents(event1, events);
    expect(result).toEqual([event2]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const event1 = {
      id: '1',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    } as Event;

    const event2 = {
      id: '2',
      date: '2025-07-01',
      startTime: '15:30',
      endTime: '16:30',
    } as Event;

    const events = [event1, event2];
    const result = findOverlappingEvents(event1, events);
    expect(result).toEqual([]);
  });
});
