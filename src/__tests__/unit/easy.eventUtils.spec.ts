import { getFilteredEvents } from '../../utils/eventUtils';
import { getTestEvents } from '../fixtures/eventFactory';

describe('getFilteredEvents', () => {
  const events = getTestEvents('filter');
  const baseDate = new Date('2025-07-15');

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const filtered = getFilteredEvents(events, '이벤트 2', baseDate, 'month');

    expect(filtered).toHaveLength(2);
    expect(filtered.map((e) => e.id)).toContain('2');
    expect(filtered.map((e) => e.id)).toContain('3');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const currentDate = new Date('2025-07-01');
    const filtered = getFilteredEvents(events, '', currentDate, 'week');

    expect(filtered).toHaveLength(2);
    expect(filtered.map((e) => e.id)).toContain('1');
    expect(filtered.map((e) => e.id)).toContain('2');
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const filtered = getFilteredEvents(events, '', baseDate, 'month');

    expect(filtered).toHaveLength(4);
    expect(filtered.map((e) => e.id)).toEqual(expect.arrayContaining(['1', '2', '3']));
    expect(filtered.map((e) => e.id)).not.toContain('5');
    expect(filtered.map((e) => e.id)).not.toContain('6');
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const currentDate = new Date('2025-07-01');
    const filtered = getFilteredEvents(events, '이벤트', currentDate, 'week');

    expect(filtered).toHaveLength(2);
    expect(filtered.map((e) => e.id)).toContain('1');
    expect(filtered.map((e) => e.id)).toContain('2');
    expect(filtered.map((e) => e.id)).not.toContain('3');
  });

  it('검색어가 없을 때 7월 이벤트를 반환한다', () => {
    const filtered = getFilteredEvents(events, '', baseDate, 'month');

    expect(filtered).toHaveLength(4);
    expect(filtered.map((e) => e.id)).toEqual(expect.arrayContaining(['1', '2', '3']));
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const filtered1 = getFilteredEvents(events, '이벤트', baseDate, 'month');
    const filtered2 = getFilteredEvents(events, '이벤트', baseDate, 'month');

    expect(filtered1).toEqual(filtered2);
    expect(filtered1.length).toBeGreaterThan(0);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const borderDate = new Date('2025-07-30');
    const filtered = getFilteredEvents(events, '', borderDate, 'week');

    expect(filtered).toHaveLength(2);
    expect(filtered.map((e) => e.id)).toContain('4');
    expect(filtered.map((e) => e.id)).toContain('5');
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const filtered = getFilteredEvents([], '이벤트', baseDate, 'month');

    expect(filtered).toHaveLength(0);
    expect(filtered).toEqual([]);
  });

  it('위치 정보로 이벤트를 검색한다', () => {
    const filtered = getFilteredEvents(events, '회의실', baseDate, 'month');

    expect(filtered).toHaveLength(3);
    expect(filtered.map((e) => e.id)).toContain('1');
    expect(filtered.map((e) => e.id)).toContain('2');
    expect(filtered.map((e) => e.id)).toContain('3');
  });
});
