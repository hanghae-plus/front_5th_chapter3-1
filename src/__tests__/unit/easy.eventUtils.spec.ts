import { Event } from '../../types';
import events from '../../__mocks__/response/events.json';
import { getFilteredEvents } from '../../utils/eventUtils';

let sampleEvents: Event[] = [];

beforeAll(() => {
  sampleEvents = events.events as unknown as Event[];
});

const getEventIds = (events: Event[]) => events.map((event) => event.id).sort();

describe('getFilteredEvents 함수 테스트', () => {
  it("제목이 '이벤트 2'인 이벤트만 찾는다", () => {
    const result = getFilteredEvents(sampleEvents, '이벤트 2', new Date('2025-07-01'), 'week');

    expect(result).toEqual([
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 2',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('주간 보기에서 해당 주(6/29 ~ 7/5)의 이벤트만 필터링한다', () => {
    const result = getFilteredEvents(sampleEvents, '', new Date('2025-07-01'), 'week');
    expect(result).toHaveLength(5);
    expect(getEventIds(result)).toEqual(['1', '2', '3', '4', '6']);
  });

  it('월간 보기에서 7월의 이벤트만 필터링한다', () => {
    const result = getFilteredEvents(sampleEvents, '', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(5);
    expect(getEventIds(result)).toEqual(['1', '2', '3', '4', '5']);
  });

  it("'이벤트'라는 단어가 포함된 제목/설명/장소만 필터링하고 주간 범위에 맞는 이벤트만 찾는다", () => {
    const result = getFilteredEvents(sampleEvents, '이벤트', new Date('2025-07-01'), 'week');
    expect(result).toHaveLength(4);
    expect(getEventIds(result)).toEqual(['1', '2', '3', '6']);
  });

  it('검색어가 없을 때 주간 범위에 있는 모든 이벤트를 보여준다', () => {
    const result = getFilteredEvents(sampleEvents, '', new Date('2025-07-01'), 'week');
    expect(result).toHaveLength(5);
    expect(getEventIds(result)).toEqual(['1', '2', '3', '4', '6']);
  });

  it("'event'로 검색해도 대소문자 구분 없이 찾을 수 있어야 한다", () => {
    const result = getFilteredEvents(sampleEvents, 'event', new Date('2025-07-01'), 'week');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('4');
  });

  it('월 경계에 있는 이벤트(7월 1일)가 제대로 포함되어야 한다', () => {
    const result = getFilteredEvents(sampleEvents, '', new Date('2025-07-01'), 'month');
    const hasJulyFirst = result.some((event) => event.date === '2025-07-01');
    expect(hasJulyFirst).toBe(true);
  });

  it('이벤트가 하나도 없으면 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2025-07-01'), 'week');
    expect(result).toEqual([]);
  });
});
