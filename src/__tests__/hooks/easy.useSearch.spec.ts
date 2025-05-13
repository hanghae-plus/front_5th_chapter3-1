import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

describe('useSearch', () => {
  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '회의',
        description: '회의 내용',
        date: '2025-05-01',
        startTime: '10:00',
        endTime: '11:00',
        location: '회의실',
        category: '회의',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '점심',
        description: '점심 내용',
        date: '2025-05-01',
        startTime: '12:00',
        endTime: '13:00',
        location: '회의실',
        category: '점심',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const currentDate = new Date('2025-05-01');

    const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

    expect(result.current.filteredEvents).toEqual(events);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '회의',
        description: '회의 내용',
        date: '2025-05-01',
        startTime: '10:00',
        endTime: '11:00',
        location: '회의실',
        category: '회의',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '점심',
        description: '점심 내용',
        date: '2025-05-01',
        startTime: '12:00',
        endTime: '13:00',
        location: '회의실',
        category: '점심',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '3',
        title: '회의',
        description: '회의 내용',
        date: '2025-05-01',
        startTime: '10:00',
        endTime: '11:00',
        location: '회의실',
        category: '점심',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '4',
        title: '저녁',
        description: '저녁 내용',
        date: '2025-05-01',
        startTime: '18:00',
        endTime: '19:00',
        location: '회의실',
        category: '저녁',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const currentDate = new Date('2025-05-01');
    const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('점심');
    });

    expect(result.current.filteredEvents).toEqual([events[1]]);
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '회의',
        description: '점심',
        date: '2025-05-01',
        startTime: '10:00',
        endTime: '11:00',
        location: '회의실',
        category: '회의',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '점심',
        description: '내용',
        date: '2025-05-01',
        startTime: '12:00',
        endTime: '13:00',
        location: '회의실',
        category: '점심',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '3',
        title: '회의',
        description: '회의 내용',
        date: '2025-05-01',
        startTime: '10:00',
        endTime: '11:00',
        location: '점심',
        category: '점심',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '4',
        title: '저녁',
        description: '저녁 내용',
        date: '2025-05-01',
        startTime: '18:00',
        endTime: '19:00',
        location: '회의실',
        category: '저녁',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const currentDate = new Date('2025-05-01');
    const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('점심');
    });

    expect(result.current.filteredEvents).toEqual([events[0], events[1], events[2]]);
  });

  it('현재 뷰(월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '회의',
        description: '점심',
        date: '2025-04-30',
        startTime: '10:00',
        endTime: '11:00',
        location: '회의실',
        category: '회의',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '점심',
        description: '내용',
        date: '2025-05-01',
        startTime: '12:00',
        endTime: '13:00',
        location: '회의실',
        category: '점심',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '3',
        title: '회의',
        description: '회의 내용',
        date: '2025-05-03',
        startTime: '10:00',
        endTime: '11:00',
        location: '점심',
        category: '점심',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '4',
        title: '저녁',
        description: '저녁 내용',
        date: '2025-05-04',
        startTime: '18:00',
        endTime: '19:00',
        location: '회의실',
        category: '저녁',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '5',
        title: '저녁',
        description: '저녁 내용',
        date: '2025-05-31',
        startTime: '18:00',
        endTime: '19:00',
        location: '회의실',
        category: '저녁',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '6',
        title: '저녁',
        description: '저녁 내용',
        date: '2025-06-01',
        startTime: '18:00',
        endTime: '19:00',
        location: '회의실',
        category: '저녁',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const currentDate = new Date('2025-05-01');
    const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

    expect(result.current.filteredEvents).toEqual([events[1], events[2], events[3], events[4]]);
  });

  it('현재 뷰(주간)에 해당하는 이벤트만 반환해야 한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '회의',
        description: '점심',
        date: '2025-04-30',
        startTime: '10:00',
        endTime: '11:00',
        location: '회의실',
        category: '회의',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '점심',
        description: '내용',
        date: '2025-05-01',
        startTime: '12:00',
        endTime: '13:00',
        location: '회의실',
        category: '점심',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '3',
        title: '회의',
        description: '회의 내용',
        date: '2025-05-03',
        startTime: '10:00',
        endTime: '11:00',
        location: '점심',
        category: '점심',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '4',
        title: '저녁',
        description: '저녁 내용',
        date: '2025-05-04',
        startTime: '18:00',
        endTime: '19:00',
        location: '회의실',
        category: '저녁',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '5',
        title: '저녁',
        description: '저녁 내용',
        date: '2025-05-31',
        startTime: '18:00',
        endTime: '19:00',
        location: '회의실',
        category: '저녁',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '6',
        title: '저녁',
        description: '저녁 내용',
        date: '2025-06-01',
        startTime: '18:00',
        endTime: '19:00',
        location: '회의실',
        category: '저녁',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const currentDate = new Date('2025-05-01');
    const { result } = renderHook(() => useSearch(events, currentDate, 'week'));

    expect(result.current.filteredEvents).toEqual([events[0], events[1], events[2]]);
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const events: Event[] = [
      {
        id: '1',
        title: '회의',
        description: '회의',
        date: '2025-05-01',
        startTime: '10:00',
        endTime: '11:00',
        location: '회의',
        category: '회의',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '점심',
        description: '점심',
        date: '2025-05-01',
        startTime: '12:00',
        endTime: '13:00',
        location: '점심',
        category: '점심',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const currentDate = new Date('2025-05-01');
    const { result } = renderHook(() => useSearch(events, currentDate, 'week'));

    act(() => {
      result.current.setSearchTerm('점심');
    });

    expect(result.current.filteredEvents).toEqual([events[1]]);

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.filteredEvents).toEqual([events[0]]);
  });
});
