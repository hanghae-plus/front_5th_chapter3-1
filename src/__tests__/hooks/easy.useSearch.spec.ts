import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

beforeEach(() => {
  const mockDate = new Date('2025-10-01');
  vi.useFakeTimers();
  vi.setSystemTime(mockDate);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useSearch 훅 테스트', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2025-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2025-10-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '팀원들과 점심 식사',
      location: '구내식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    },
    {
      id: '3',
      title: '프로젝트 미팅',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '신규 프로젝트 논의',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
    {
      id: '4',
      title: '생일 파티',
      date: '2025-11-05',
      startTime: '18:00',
      endTime: '20:00',
      description: '동료 생일 축하',
      location: '레스토랑',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 60,
    },
  ];
  it('검색어가 비어있을 때 현재 뷰에 해당하는 모든 이벤트를 반환해야 한다', () => {
    const currentDate = new Date('2025-10-01');
    const view = 'month';

    const { result } = renderHook(() => useSearch(mockEvents, currentDate, view));

    expect(result.current.filteredEvents).toHaveLength(3);
    expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '2', '3']);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const currentDate = new Date('2025-10-01');
    const view = 'month';

    const { result } = renderHook(() => useSearch(mockEvents, currentDate, view));

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.filteredEvents).toHaveLength(2);
    expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '3']);
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const currentDate = new Date('2025-10-01');
    const view = 'month';

    const { result } = renderHook(() => useSearch(mockEvents, currentDate, view));

    act(() => {
      result.current.setSearchTerm('점심');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].id).toBe('2');

    act(() => {
      result.current.setSearchTerm('팀');
    });
    expect(result.current.filteredEvents).toHaveLength(2);
    expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '2']);

    act(() => {
      result.current.setSearchTerm('회의실');
    });
    expect(result.current.filteredEvents).toHaveLength(2);
    expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '3']);
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const currentDate = new Date('2025-10-01');

    const { result: monthResult } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));
    expect(monthResult.current.filteredEvents).toHaveLength(3);
    expect(monthResult.current.filteredEvents.map((e) => e.id)).toEqual(['1', '2', '3']);

    const { result: weekResult } = renderHook(() => useSearch(mockEvents, currentDate, 'week'));
    expect(weekResult.current.filteredEvents).toHaveLength(2);
    expect(weekResult.current.filteredEvents.map((e) => e.id)).toEqual(['1', '2']);
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const currentDate = new Date('2025-10-01');
    const view = 'month';

    const { result } = renderHook(() => useSearch(mockEvents, currentDate, view));

    act(() => {
      result.current.setSearchTerm('회의');
    });
    expect(result.current.filteredEvents).toHaveLength(2);
    expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '3']);

    act(() => {
      result.current.setSearchTerm('점심');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].id).toBe('2');
  });
});
