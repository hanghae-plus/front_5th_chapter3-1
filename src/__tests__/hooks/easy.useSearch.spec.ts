import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

describe('useSearch', () => {
  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트1',
        description: '이벤트1 설명',
        location: '이벤트1 위치',
        date: '2025-05-13',
        startTime: '10:00',
        endTime: '11:00',
        category: 'event',
        repeat: {
          type: 'daily',
          interval: 1,
        },
        notificationTime: 10,
      },
    ];
    const { result } = renderHook(() => useSearch(events, new Date('2025-05-13'), 'month'));

    act(() => {
      result.current.setSearchTerm('');
    });

    expect(result.current.filteredEvents).toEqual(events);
  });
  
  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const targetEvent: Event = {
      id: '1',
      title: '이벤트1',
      description: '이벤트1 설명',
      location: '이벤트1 위치',
      date: '2025-05-13',
      startTime: '10:00',
      endTime: '11:00',
      category: 'event',
      repeat: {
        type: 'daily',
        interval: 1,
      },
      notificationTime: 10,
    };
    const otherEvent: Event = {
      id: '2',
      title: '회의1',
      description: '회의1 설명',
      location: '회의1 위치',
      date: '2025-05-13',
      startTime: '11:00',
      endTime: '12:00',
      category: 'event',
      repeat: {
        type: 'daily',
        interval: 1,
      },
      notificationTime: 10,
    };
    const events: Event[] = [targetEvent, otherEvent];
    const { result } = renderHook(() => useSearch(events, new Date('2025-05-13'), 'month'));

    act(() => {
      result.current.setSearchTerm('이벤트1');
    });

    expect(result.current.filteredEvents).toEqual([targetEvent]);
  });
  
  // 여러 조건 중 하나 일치 => 여러 조건을 분리함 (제목, 설명, 위치)
  it('검색어가 제목과 일치하면 해당 이벤트를 반환해야 한다', () => {
    const targetEvent: Event = {
      id: '1',
      title: '이벤트',
      description: '설명',
      location: '위치',
      date: '2025-05-13',
      startTime: '10:00',
      endTime: '11:00',
      category: 'event',
      repeat: {
        type: 'daily',
        interval: 1,
      },
      notificationTime: 10,
    };
    const events: Event[] = [targetEvent];
    const { result } = renderHook(() => useSearch(events, new Date('2025-05-13'), 'month'));

    act(() => {
      result.current.setSearchTerm('이벤트');
    });

    expect(result.current.filteredEvents).toEqual([targetEvent]);
  });

  it('검색어가 설명과 일치하면 해당 이벤트를 반환해야 한다', () => {
    const targetEvent: Event = {
      id: '1',
      title: '이벤트',
      description: '설명',
      location: '위치',
      date: '2025-05-13',
      startTime: '10:00',
      endTime: '11:00',
      category: 'event',
      repeat: {
        type: 'daily',
        interval: 1,
      },
      notificationTime: 10,
    };
    const events: Event[] = [targetEvent];
    const { result } = renderHook(() => useSearch(events, new Date('2025-05-13'), 'month'));

    act(() => {
      result.current.setSearchTerm('설명');
    });

    expect(result.current.filteredEvents).toEqual([targetEvent]);
  });

  it('검색어가 위치와 일치하면 해당 이벤트를 반환해야 한다', () => {
    const targetEvent: Event = {
      id: '1',
      title: '이벤트',
      description: '설명',
      location: '위치',
      date: '2025-05-13',
      startTime: '10:00',
      endTime: '11:00',
      category: 'event',
      repeat: {
        type: 'daily',
        interval: 1,
      },
      notificationTime: 10,
    };
    const events: Event[] = [targetEvent];
    const { result } = renderHook(() => useSearch(events, new Date('2025-05-13'), 'month'));

    act(() => {
      result.current.setSearchTerm('위치');
    });

    expect(result.current.filteredEvents).toEqual([targetEvent]);
  });
  
  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const targetEvent: Event = {
      id: '1',
      title: '이벤트1',
      description: '이벤트1 설명',
      location: '이벤트1 위치',
      date: '2025-05-13',
      startTime: '10:00',
      endTime: '11:00',
      category: 'event',
      repeat: {
        type: 'daily',
        interval: 1,
      },
      notificationTime: 10,
    };
    const otherEvent: Event = {
      id: '2',
      title: '이벤트2',
      description: '이벤트2 설명',
      location: '이벤트2 위치',
      date: '2025-06-01',
      startTime: '11:00',
      endTime: '12:00',
      category: 'event',
      repeat: {
        type: 'daily',
        interval: 1,
      },
      notificationTime: 10,
    };
    const events: Event[] = [targetEvent, otherEvent];
    const { result } = renderHook(() => useSearch(events, new Date('2025-05-13'), 'month'));

    act(() => {
      result.current.setSearchTerm('이벤트');
    });

    expect(result.current.filteredEvents).toEqual([targetEvent]);
  });
  
  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const meetingEvent: Event = {
      id: '1',
      title: '회의',
      description: '회의 설명',
      location: '회의 위치',
      date: '2025-05-13',
      startTime: '10:00',
      endTime: '11:00',
      category: 'event',
      repeat: {
        type: 'daily',
        interval: 1,
      },
      notificationTime: 10,
    };
    const lunchEvent: Event = {
      id: '2',
      title: '회식',
      description: '점심 식사',
      location: '식당',
      date: '2025-05-13',
      startTime: '12:00',
      endTime: '13:00',
      category: 'event',
      repeat: {
        type: 'daily',
        interval: 1,
      },
      notificationTime: 10,
    };
    const events: Event[] = [meetingEvent, lunchEvent];

    const { result } = renderHook(() => useSearch(events, new Date('2025-05-13'), 'month'));

    // 초기 검색어 '회의'로 필터링 결과 확인
    act(() => {
      result.current.setSearchTerm('회의');
    });
    expect(result.current.filteredEvents).toEqual([meetingEvent]);

    // 검색어를 '점심'으로 변경 시 즉시 필터링 결과 업데이트 확인
    act(() => {
      result.current.setSearchTerm('점심');
    });
    expect(result.current.filteredEvents).toEqual([events[1]]);
  });
})
