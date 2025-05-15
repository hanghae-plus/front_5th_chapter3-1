import { mockEvents as events } from '../../__mocks__/response/mockEvents.json';
import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

const mockEvents = events as Event[];

const mockDate1 = new Date('2025-07-01');
const mockDate2 = new Date('2025-07-15');

describe('getFilteredEvents', () => {
  it("검색어 '일정1'에 맞는 이벤트만 반환한다", () => {
    const filteredEvents = getFilteredEvents(mockEvents, '일정1', mockDate1, undefined as any);
    expect(filteredEvents.length).toBe(1);
    expect(filteredEvents[0].description).toBe('일정1 설명');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, '', mockDate1, 'week');
    expect(filteredEvents.length).toBe(3);

    const toBeId = ['1', '2', '7'];
    expect(filteredEvents.map((e) => e.id).sort()).toEqual(toBeId);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, '', mockDate2, 'month');
    expect(filteredEvents.length).toBe(6);

    const toBeId = ['1', '2', '3', '4', '5', '6'];
    expect(filteredEvents.map((e) => e.id).sort()).toEqual(toBeId);
  });

  it("검색어 '일정'과 주간 뷰 필터링을 동시에 적용한다", () => {
    const filteredEvents = getFilteredEvents(mockEvents, '일정', mockDate1, 'week');
    expect(filteredEvents.length).toBe(3);

    const toBeId = ['1', '2', '7'];
    expect(filteredEvents.map((e) => e.id).sort()).toEqual(toBeId);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, '', mockDate2, 'month');
    expect(filteredEvents.length).toBe(6);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, 'sametitle', mockDate2, 'month');
    expect(filteredEvents.length).toBe(2);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, '', mockDate2, 'month');
    const toBeId = ['1', '2', '3', '4', '5', '6'];
    expect(filteredEvents.map((e) => e.id).sort()).toEqual(toBeId);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const filteredEvents = getFilteredEvents([], '', mockDate2, 'month');
    expect(filteredEvents).toEqual([]);
  });
});
