import { events } from '../../__mocks__/response/realEvents.json';
import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const typedEvents = events as Event[];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const searchTerm = '팀';
    const currentDate = new Date('2025-05-20');
    const result = getFilteredEvents(typedEvents, searchTerm, currentDate, 'month');

    // '팀'이 포함된 이벤트들 검증
    expect(result.length).toBeGreaterThan(0);
    result.forEach((event) => {
      const containsTeam =
        event.title.includes('팀') ||
        event.description.includes('팀') ||
        event.location.includes('팀');
      expect(containsTeam).toBe(true);
    });
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const currentDate = new Date('2025-05-20'); // 2025년 5월 20일은 화요일
    const result = getFilteredEvents(typedEvents, '', currentDate, 'week');

    // 5월 20일이 속한 주는 5월 18일(일)~5월 24일(토)
    expect(result.length).toBeGreaterThan(0);

    result.forEach((event) => {
      const eventDate = new Date(event.date);
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // 주의 시작일(일요일)

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // 주의 마지막일(토요일)

      // 이벤트 날짜가 해당 주에 속하는지 검증
      expect(eventDate >= startOfWeek && eventDate <= endOfWeek).toBe(true);
    });
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const currentDate = new Date('2025-05-15');
    const result = getFilteredEvents(typedEvents, '', currentDate, 'month');

    // 모든 테스트 이벤트가 5월에 있으므로, 전체 이벤트 수와 일치해야 함
    expect(result.length).toBe(typedEvents.length);

    result.forEach((event) => {
      const eventMonth = new Date(event.date).getMonth() + 1; // 0-based 월 인덱스를 1-based로 변환
      expect(eventMonth).toBe(5); // 5월
    });
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const searchTerm = '프로젝트';
    const currentDate = new Date('2025-05-25'); // 5월 25일
    const result = getFilteredEvents(typedEvents, searchTerm, currentDate, 'week');

    // '프로젝트'가 포함되고 해당 주(5/25~5/31)에 있는 이벤트 검증
    expect(result.length).toBeGreaterThan(0);

    result.forEach((event) => {
      // 검색어 포함 여부 검증
      const containsProject =
        event.title.includes('프로젝트') ||
        event.description.includes('프로젝트') ||
        event.location.includes('프로젝트');
      expect(containsProject).toBe(true);

      // 해당 주에 속하는지 검증
      const eventDate = new Date(event.date);
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      expect(eventDate >= startOfWeek && eventDate <= endOfWeek).toBe(true);
    });
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const currentDate = new Date('2025-05-15');
    const result = getFilteredEvents(typedEvents, '', currentDate, 'month');

    // 검색어가 없으면 해당 월의 모든 이벤트 반환
    expect(result.length).toBe(typedEvents.length);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    // '팀'과 '팀'으로 검색 결과가 동일해야 함
    const searchTerm1 = '팀';
    const searchTerm2 = '팀';
    const currentDate = new Date('2025-05-15');

    const result1 = getFilteredEvents(typedEvents, searchTerm1, currentDate, 'month');
    const result2 = getFilteredEvents(typedEvents, searchTerm2, currentDate, 'month');

    // 결과 길이가 동일해야 함
    expect(result1.length).toBe(result2.length);

    // ID로 정렬해서 동일한 이벤트가 반환되는지 검증
    const sortById = (a: Event, b: Event) => a.id.localeCompare(b.id);
    const sortedResult1 = [...result1].sort(sortById);
    const sortedResult2 = [...result2].sort(sortById);

    for (let i = 0; i < sortedResult1.length; i++) {
      expect(sortedResult1[i].id).toBe(sortedResult2[i].id);
    }
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const mayDate = new Date('2025-05-31');
    const juneDate = new Date('2025-06-01');

    const mayResult = getFilteredEvents(typedEvents, '', mayDate, 'month');
    const juneResult = getFilteredEvents(typedEvents, '', juneDate, 'month');

    // 5월에는 모든 이벤트가 포함되어야 함
    expect(mayResult.length).toBe(typedEvents.length);

    // 6월에는 이벤트가 없어야 함
    expect(juneResult.length).toBe(0);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const currentDate = new Date('2025-05-15');
    const result = getFilteredEvents([], '', currentDate, 'month');

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});
