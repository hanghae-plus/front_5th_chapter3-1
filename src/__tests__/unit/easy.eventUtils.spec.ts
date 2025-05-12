import eventsData from '../../__mocks__/response/events.json';
import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const events = eventsData.events as Event[];
    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'month');
    expect(result).toEqual([events[1]]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const events = eventsData.events as Event[];
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    expect(result).toEqual([events[0], events[1], events[2], events[3]]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const events = eventsData.events as Event[];
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(result).toEqual([
      events[0],
      events[1],
      events[2],
      events[3],
      events[4],
      events[5],
      events[6],
      events[7],
    ]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const events = eventsData.events as Event[];
    const result = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');
    expect(result).toEqual([events[0], events[1], events[2]]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events = eventsData.events as Event[];
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    expect(result).toEqual([events[0], events[1], events[2], events[3]]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events = eventsData.events as Event[];
    const result = getFilteredEvents(events, 'event', new Date('2025-07-10'), 'week');
    expect(result).toEqual([events[5], events[6]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events = eventsData.events as Event[];
    const result = getFilteredEvents(events, '', new Date('2025-08-01'), 'week');
    expect(result).toEqual([events[7]]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events = eventsData.events as Event[];
    const result = getFilteredEvents(events, 'event', new Date('2024-07-10'), 'week');
    expect(result).toEqual([]);
  });
});
