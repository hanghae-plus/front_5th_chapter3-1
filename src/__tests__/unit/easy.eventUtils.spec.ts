import mockEventData from '../../__mocks__/response/mockEvent.json';
import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const currentDate = new Date('2025-07-01');
  const mockEvents = mockEventData.events as Event[];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트 2', currentDate, 'month');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'week');
    const dates = result.map((e) => e.date);
    expect(dates).toContain('2025-07-01');
    expect(dates).toContain('2025-07-02');
    expect(dates).not.toContain('2025-06-28');
    expect(dates).not.toContain('2025-07-31');
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(3);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트', new Date('2025-07-01'), 'week');
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2', 'Another Event']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(3);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(mockEvents, 'another', new Date('2025-06-30'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'month');
    const titles = result.map((e) => e.title);
    expect(titles).toContain('월말 이벤트');
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '이벤트', currentDate, 'week');
    expect(result).toEqual([]);
  });
});
