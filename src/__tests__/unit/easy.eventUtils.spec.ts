import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';
import { MOCK_EVENTS } from '../mock';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(MOCK_EVENTS, '이벤트 2', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(MOCK_EVENTS, '', new Date('2025-07-01'), 'week');
    expect(result.map((e) => e.id)).toEqual(['2']);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(MOCK_EVENTS, '', new Date('2025-07-15'), 'month');
    expect(result.map((e) => e.id)).toEqual(['2', '3', '4']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(MOCK_EVENTS, '이벤트', new Date('2025-07-01'), 'week');
    expect(result.map((e) => e.id)).toEqual(['2']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(MOCK_EVENTS, '', new Date('2025-07-01'), 'month');
    expect(result.map((e) => e.id)).toEqual(['2', '3', '4']);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(MOCK_EVENTS, 'event', new Date('2025-07-15'), 'month');
    expect(result.map((e) => e.id)).toEqual(['4']);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(MOCK_EVENTS, '', new Date('2025-07-01'), 'month');
    expect(result.map((e) => e.id)).toEqual(['2', '3', '4']);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2025-07-01'), 'month');
    expect(result).toEqual([]);
  });
});
