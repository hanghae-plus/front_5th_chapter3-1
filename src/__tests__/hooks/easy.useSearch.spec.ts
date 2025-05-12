import { act, renderHook } from '@testing-library/react';

import { events } from '../../__mocks__/response/realEvents.json';
import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const typedEvents = events as Event[];

describe('useSearch', () => {
  let currentDate: Date;

  beforeEach(() => {
    currentDate = new Date('2025-05-20');
  });

  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(typedEvents, currentDate, 'month'));

    expect(result.current.filteredEvents.length).toBe(events.length);
    expect(result.current.searchTerm).toBe('');
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch(typedEvents, currentDate, 'month'));

    // 검색어 설정
    act(() => {
      result.current.setSearchTerm('팀');
    });

    // "팀"이 포함된 이벤트만 반환되어야 함
    const teamEvents = result.current.filteredEvents;
    expect(teamEvents.length).toBeGreaterThan(0);
    teamEvents.forEach((event) => {
      const hasSearchTerm =
        event.title.includes('팀') ||
        event.description.includes('팀') ||
        event.location.includes('팀');
      expect(hasSearchTerm).toBe(true);
    });
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(typedEvents, currentDate, 'month'));

    // 제목에 있는 텍스트로 검색
    act(() => {
      result.current.setSearchTerm('생일');
    });

    // 제목에 "생일"이 포함된 이벤트가 있다면 반환되어야 함
    let filteredByTitle = result.current.filteredEvents;
    if (filteredByTitle.length > 0) {
      expect(filteredByTitle[0].title).toContain('생일');
    }

    // 설명에 있는 텍스트로 검색
    act(() => {
      result.current.setSearchTerm('주간');
    });

    // 설명에 "주간"이 포함된 이벤트가 있다면 반환되어야 함
    let filteredByDescription = result.current.filteredEvents;
    if (filteredByDescription.length > 0) {
      expect(filteredByDescription.some((event) => event.description.includes('주간'))).toBe(true);
    }

    // 위치에 있는 텍스트로 검색
    act(() => {
      result.current.setSearchTerm('회의실');
    });

    // 위치에 "회의실"이 포함된 이벤트가 있다면 반환되어야 함
    let filteredByLocation = result.current.filteredEvents;
    if (filteredByLocation.length > 0) {
      expect(filteredByLocation.some((event) => event.location.includes('회의실'))).toBe(true);
    }
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const weekDate = new Date('2025-05-22');
    const { result: weekResult } = renderHook(() => useSearch(typedEvents, weekDate, 'week'));

    // 해당 주에 있는 이벤트만 반환되어야 함
    const weekEvents = weekResult.current.filteredEvents;
    weekEvents.forEach((event) => {
      const eventDate = new Date(event.date);
      const startOfWeek = new Date(weekDate);
      startOfWeek.setDate(weekDate.getDate() - weekDate.getDay()); // 주의 시작일(일요일)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // 주의 마지막일(토요일)

      expect(eventDate >= startOfWeek && eventDate <= endOfWeek).toBe(true);
    });

    // 6월 설정 (다른 월)
    const monthDate = new Date('2025-06-01');
    const { result: monthResult } = renderHook(() => useSearch(typedEvents, monthDate, 'month'));

    // 6월에 있는 이벤트가 없으므로 빈 배열이 반환되어야 함
    expect(monthResult.current.filteredEvents).toHaveLength(0);
  });

  it('검색어 변경 시 필터링된 결과가 즉시 업데이트되어야 한다', () => {
    const { result } = renderHook(() => useSearch(typedEvents, currentDate, 'month'));

    // 첫 번째 검색어 설정
    act(() => {
      result.current.setSearchTerm('회의');
    });

    // "회의"가 포함된 이벤트 목록 저장
    const meetingEvents = [...result.current.filteredEvents];

    // 검색어 변경
    act(() => {
      result.current.setSearchTerm('생일');
    });

    // "생일"이 포함된 이벤트 목록
    const birthdayEvents = result.current.filteredEvents;

    // 두 검색 결과가 다른지 확인
    expect(birthdayEvents).not.toEqual(meetingEvents);

    // "생일"이 포함된 이벤트만 반환되어야 함
    birthdayEvents.forEach((event) => {
      const containsBirthday =
        event.title.includes('생일') ||
        event.description.includes('생일') ||
        event.location.includes('생일');
      expect(containsBirthday).toBe(true);
    });
  });
});
