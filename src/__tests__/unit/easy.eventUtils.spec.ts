import eventsData from '../../__mocks__/response/events.json';
import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events = eventsData.events as Event[];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const searchTerm = '이벤트 2';
    const currentDate = new Date('2025-11-01');

    const filteredEvents = getFilteredEvents(events, searchTerm, currentDate, 'week');

    expect(filteredEvents).toEqual([events[2]]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');

    expect(filteredEvents).toEqual([events[3], events[4]]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(filteredEvents).toEqual([events[3], events[4], events[5], events[6]]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const filteredEvents = getFilteredEvents(events, '이벤트', new Date('2025-11-01'), 'week');

    expect(filteredEvents).toEqual([events[2]]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-11-01'), 'week');
    const expected = events.filter((event) => event.date === '2025-11-01');

    expect(filteredEvents).toEqual(expected);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const filteredEvents = getFilteredEvents(events, 'class', new Date('2025-09-16'), 'week');

    expect(filteredEvents).toEqual([events[7]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-09-01'), 'month');

    expect(filteredEvents).toEqual([events[7]]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const filteredEvents = getFilteredEvents([], '', new Date('2025-11-01'), 'week');

    expect(filteredEvents).toEqual([]);
  });
});
