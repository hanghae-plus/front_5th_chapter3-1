import {convertEventToDateRange, findOverlappingEvents, isOverlapping, parseDateTime,} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = '2025-07-01';
    const time = '14:30';
    const result = parseDateTime(date, time);
    expect(result).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-0701';
    const time = '14:30';
    const result = parseDateTime(date, time);
    expect(isNaN(result.getDate())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-0701';
    const time = '1430';
    const result = parseDateTime(date, time);
    expect(isNaN(result.getDate())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = '';
    const time = '14:30';
    const result = parseDateTime(date, time);
    expect(isNaN(result.getDate())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = {
      date: '2025-05-13',
      startTime: '14:30',
      endTime: '15:30',
    };
    const result = convertEventToDateRange(event);
    expect(result).toEqual({
      start: new Date('2025-05-13T14:30:00'),
      end: new Date('2025-05-13T15:30:00'),
    })
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = {
      date: '2025-0513',
      startTime: '14:30',
      endTime: '15:30',
    };
    const result = convertEventToDateRange(event);
    expect(isNaN(result.start.getDate())).toBe(true);
    expect(isNaN(result.end.getDate())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = {
      date: '2025-05-13',
      startTime: '1430',
      endTime: '1530',
    };
    const result = convertEventToDateRange(event);
    expect(isNaN(result.start.getDate())).toBe(true);
    expect(isNaN(result.end.getDate())).toBe(true);
  });
});

describe('isOverlapping', () => {

  const event1 = {
    id: '1',
    date: '2025-05-13',
    startTime: '12:30',
    endTime: '13:30',
  };
  const event2 = {
    id: '2',
    date: '2025-05-13',
    startTime: '12:30',
    endTime: '13:30',
  };
  const event3 = {
    id: '3',
    date: '2025-05-14',
    startTime: '12:30',
    endTime: '13:30',
  };

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const result = isOverlapping(event1, event2);
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const result = isOverlapping(event1, event3);
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {

  const event1 = {
    id: '1',
    date: '2025-05-13',
    startTime: '12:30',
    endTime: '13:30',
  };
  const event2 = {
    id: '2',
    date: '2025-05-13',
    startTime: '12:30',
    endTime: '13:30',
  };
  const event3 = {
    id: '3',
    date: '2025-05-14',
    startTime: '12:30',
    endTime: '13:30',
  };
  const events = [event1, event2, event3];
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {

    const result = findOverlappingEvents(event1, events);
    expect(result).toEqual([event2])
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const events = [event1, event2];
    const result = findOverlappingEvents(event3, events);
    expect(result).toEqual([])
  });
});
