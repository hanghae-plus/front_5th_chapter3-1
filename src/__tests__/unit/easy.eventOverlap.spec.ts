import { events } from '../../__mocks__/response/mockEvents.json' assert { type: 'json' };
import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
const MOCK_EVENTS = [...events] as Event[];
describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2025-07-01', '14:30')).toEqual(new Date('2025-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-05-50', '23:00').toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-05-14', '25:00').toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '25:00').toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  const event = MOCK_EVENTS[0];

  const { date, startTime, endTime } = event;

  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    expect(convertEventToDateRange(event)).toEqual({
      start: parseDateTime(date, startTime),
      end: parseDateTime(date, endTime),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    expect(
      convertEventToDateRange({
        ...event,
        date: '2025-05-50',
      })
    ).toEqual({
      start: new Date(NaN),
      end: new Date(NaN),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    expect(
      convertEventToDateRange({
        ...event,
        startTime: '99:99',
        endTime: '99:99',
      })
    ).toEqual({
      start: new Date(NaN),
      end: new Date(NaN),
    });
  });
});

describe('isOverlapping', () => {
  const event = MOCK_EVENTS[0];

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    expect(
      isOverlapping(
        {
          ...event,
          date: '2025-05-14',
          startTime: '09:00',
          endTime: '10:00',
        },
        {
          ...event,
          date: '2025-05-14',
          startTime: '09:30',
          endTime: '10:00',
        }
      )
    ).toBeTruthy();
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    expect(
      isOverlapping(
        {
          ...event,
          date: '2025-05-14',
          startTime: '09:00',
          endTime: '10:00',
        },
        {
          ...event,
          date: '2025-05-14',
          startTime: '10:00',
          endTime: '11:00',
        }
      )
    ).toBeFalsy();
  });
});

describe('findOverlappingEvents', () => {
  const event = MOCK_EVENTS[0];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    expect(
      findOverlappingEvents({ ...event, id: `${MOCK_EVENTS.length + 1}` }, MOCK_EVENTS)
    ).toHaveLength(1);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    expect(
      findOverlappingEvents(
        {
          ...event,
          id: `${MOCK_EVENTS.length + 1}`,
          startTime: '23:00',
          endTime: '24:00',
        },
        MOCK_EVENTS
      )
    ).toHaveLength(0);
  });
});
