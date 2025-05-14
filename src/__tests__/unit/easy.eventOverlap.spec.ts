import { fillZero } from '../../utils/dateUtils';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import { makeEvents } from '../utils';

describe('parseDateTime', () => {
  const invalidDate = new Date('Invalid Date');

  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');

    expect(result).toBeInstanceOf(Date);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('aa', '14:30');

    expect(result).toStrictEqual(invalidDate);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', 'aa:bb');

    expect(result).toStrictEqual(invalidDate);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');

    expect(result).toStrictEqual(invalidDate);
  });
});

describe('convertEventToDateRange', () => {
  const [EVENT] = makeEvents(1);
  const invalidDate = new Date('Invalid Date');

  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(EVENT);

    expect(result).toStrictEqual({
      start: new Date(`${EVENT.date}T${EVENT.startTime}`),
      end: new Date(`${EVENT.date}T${EVENT.endTime}`),
    });
  });
  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const INVALID_DATE_EVENT = { ...EVENT, date: 'Invalid Date' };
    const result = convertEventToDateRange(INVALID_DATE_EVENT);

    expect(result).toStrictEqual({
      start: invalidDate,
      end: invalidDate,
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const INVALID_TIME_EVENT = { ...EVENT, startTime: 'Invalid Time', endTime: 'Invalid Time' };
    const result = convertEventToDateRange(INVALID_TIME_EVENT);

    expect(result).toStrictEqual({
      start: invalidDate,
      end: invalidDate,
    });
  });
});

describe('isOverlapping', () => {
  const [EVENT1, EVENT2] = makeEvents(2);
  const [OVERLAPPING_EVENT1, OVERLAPPING_EVENT2] = makeEvents(2).map((event, index) => ({
    ...event,
    date: '2025-07-01',
    startTime: index === 0 ? '14:00' : '15:00',
    endTime: index === 0 ? '16:00' : '17:00',
  }));

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const result = isOverlapping(OVERLAPPING_EVENT1, OVERLAPPING_EVENT2);

    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const result = isOverlapping(EVENT1, EVENT2);

    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const [EVENT1, EVENT2] = makeEvents(2);

    const result = findOverlappingEvents(EVENT1, [EVENT2]);

    expect(result).toStrictEqual([]);
  });
  it('🐬 겹치는 이벤트가 있으면 겹치는 이벤트를 반환한다', () => {
    const ROOT_EVENT = {
      ...makeEvents(1)[0],
      date: '2025-07-01',
      startTime: '12:00',
      endTime: '18:00',
    };
    const EVENTS = makeEvents(10).map((event, index) => ({
      ...event,
      date: '2025-07-01',
      startTime: `${fillZero(index + 1)}:00`,
      endTime: `${fillZero(index + 10)}:00`,
    }));

    const result = findOverlappingEvents(ROOT_EVENT, EVENTS);

    const overlappingEvents = EVENTS.filter((event) => isOverlapping(event, ROOT_EVENT));

    expect(overlappingEvents).toStrictEqual(result);
  });
});
