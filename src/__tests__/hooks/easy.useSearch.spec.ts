import { act, renderHook, cleanup } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';
import dummyEvents from '../dummy/dummyEventsMonth.json' assert { type: 'json' };

describe('useSearch Hook', () => {
  const getMockEvents = () => {
    return JSON.parse(JSON.stringify(dummyEvents.events)) as Event[];
  };
  const filterEventsByView = (view: 'week' | 'month', baseDate: Date, mockEvents: Event[]) => {
    if (view === 'month') {
      return mockEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getFullYear() === baseDate.getFullYear() &&
          eventDate.getMonth() === baseDate.getMonth()
        );
      });
    } else {
      // view === 'week'
      const startOfWeek = new Date(baseDate);
      startOfWeek.setDate(baseDate.getDate() - baseDate.getDay()); // 주의 첫 날 (일요일)
      startOfWeek.setHours(0, 0, 0, 0); // 자정으로 설정

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // 주의 마지막 날 (토요일)
      endOfWeek.setHours(23, 59, 59, 999); // 하루의 끝으로 설정

      return mockEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      });
    }
  };

  const filterEventsBySearchTerm = (searchTerm: string, mockEvents: Event[]) =>
    mockEvents.filter(
      (event) =>
        event.title.includes(searchTerm) ||
        event.description.includes(searchTerm) ||
        event.location.includes(searchTerm)
    );

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const MOCK_INITIAL_DATE = new Date('2025-11-01');
    vi.setSystemTime(MOCK_INITIAL_DATE);
    const mockEvents = getMockEvents();
    const { result } = renderHook(() => useSearch(mockEvents, MOCK_INITIAL_DATE, 'month'));
    expect(result.current.filteredEvents).toEqual(mockEvents);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const MOCK_INITIAL_DATE = new Date('2025-11-01');
    vi.setSystemTime(MOCK_INITIAL_DATE);
    const mockEvents = getMockEvents();
    const { result } = renderHook(() => useSearch(mockEvents, MOCK_INITIAL_DATE, 'month'));

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.filteredEvents).toEqual(filterEventsBySearchTerm('회의', mockEvents));
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const MOCK_INITIAL_DATE = new Date('2025-11-01');
    vi.setSystemTime(MOCK_INITIAL_DATE);
    const mockEvents = getMockEvents();
    const { result } = renderHook(() => useSearch(mockEvents, MOCK_INITIAL_DATE, 'month'));

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.filteredEvents).toEqual(filterEventsBySearchTerm('회의', mockEvents));

    act(() => {
      result.current.setSearchTerm('점심');
    });

    expect(result.current.filteredEvents).toEqual(filterEventsBySearchTerm('점심', mockEvents));
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const MOCK_INITIAL_DATE = new Date('2025-11-01');
    vi.setSystemTime(MOCK_INITIAL_DATE);
    const mockEvents = getMockEvents();
    const { result, rerender, unmount } = renderHook(
      ({ view }: { view: 'week' | 'month' }) => useSearch(mockEvents, MOCK_INITIAL_DATE, view),
      { initialProps: { view: 'month' } }
    );

    // 월간 뷰 테스트
    expect(result.current.filteredEvents).toEqual(
      filterEventsByView('month', MOCK_INITIAL_DATE, mockEvents)
    );

    // 주간 뷰로 변경하여 테스트
    rerender({ view: 'week' });
    expect(result.current.filteredEvents).toEqual(
      filterEventsByView('week', MOCK_INITIAL_DATE, mockEvents)
    );

    unmount();
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const MOCK_INITIAL_DATE = new Date('2025-11-01');
    vi.setSystemTime(MOCK_INITIAL_DATE);
    const mockEvents = getMockEvents();
    const { result, unmount } = renderHook(() => useSearch(mockEvents, MOCK_INITIAL_DATE, 'month'));

    // 초기 상태 확인 (검색어 없음)
    expect(result.current.searchTerm).toBe('');
    expect(result.current.filteredEvents).toEqual(mockEvents);

    // '회의' 검색어 설정 전 이벤트 개수 저장
    const initialEventsCount = result.current.filteredEvents.length;

    // '회의' 검색어 설정
    act(() => {
      result.current.setSearchTerm('회의');
    });

    // '회의' 필터링 결과 확인
    const meetingEvents = filterEventsBySearchTerm('회의', mockEvents);
    expect(result.current.filteredEvents).toEqual(meetingEvents);
    expect(result.current.searchTerm).toBe('회의');

    // 이벤트 개수가 변했는지 확인 (필터링이 적용되었는지 확인)
    expect(result.current.filteredEvents.length).not.toBe(initialEventsCount);

    // 각 이벤트가 실제로 '회의'를 포함하는지 확인
    result.current.filteredEvents.forEach((event) => {
      const containsSearchTerm =
        event.title.includes('회의') ||
        event.description.includes('회의') ||
        event.location.includes('회의');
      expect(containsSearchTerm).toBe(true);
    });

    // '점심' 검색어로 변경
    act(() => {
      result.current.setSearchTerm('점심');
    });

    // '점심' 필터링 결과 확인
    const lunchEvents = filterEventsBySearchTerm('점심', mockEvents);
    expect(result.current.filteredEvents).toEqual(lunchEvents);
    expect(result.current.searchTerm).toBe('점심');

    // 검색어 제거 시 모든 이벤트가 다시 표시되는지 확인
    act(() => {
      result.current.setSearchTerm('');
    });

    // 검색어 제거 후 결과 확인
    expect(result.current.filteredEvents).toEqual(mockEvents);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.filteredEvents.length).toBe(initialEventsCount);

    unmount();
  });
});
