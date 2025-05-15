import { act, renderHook } from '@testing-library/react';
import { describe, it, beforeEach, expect } from 'vitest';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

// 테스트용 변수 정의
const currentDate = new Date('2025-05-21');
const monthView = 'month' as const;
const weekView = 'week' as const;

// 테스트용 이벤트 데이터
export const dummyEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      description: '주간 팀 미팅',
      location: '회의실 A',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 1,
    },
    {
      id: '2',
      title: '점심 약속',
      description: '동료와 점심 식사',
      location: '회사 근처 식당',
      date: '2025-05-21',
      startTime: '12:30',
      endTime: '13:30',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 1,
    },
    {
      id: '3',
      title: '프로젝트 마감',
      description: '분기별 프로젝트 마감',
      location: '사무실',
      date: '2025-05-25',
      startTime: '09:00',
      endTime: '18:00',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 1,
    },
    {
      id: '4',
      title: '생일 파티',
      description: '친구 생일 축하',
      location: '친구 집',
      date: '2025-05-28',
      startTime: '19:00',
      endTime: '22:00',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 1,
    },
    {
      id: '5',
      title: '운동',
      description: '주간 운동',
      location: '헬스장',
      date: '2025-05-22',
      startTime: '18:00',
      endTime: '19:00',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 1,
    },
  ];
  
it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(dummyEvents, currentDate, monthView));
    expect(result.current.filteredEvents).toEqual(dummyEvents);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch(dummyEvents, currentDate, monthView));
    // act로 검색어 설정
    act(() => {
        result.current.setSearchTerm('프로젝트');
      });
      // '프로젝트'가 포함된 title 또는 description 매칭 (id: '3' 이벤트만 매칭)
      expect(result.current.filteredEvents.length).toBe(1);
      expect(result.current.filteredEvents[0].id).toBe('3');
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(dummyEvents, currentDate, monthView));
    act(() => {
      result.current.setSearchTerm('회사 근처');
    });
    // '회사 근처'가 포함된 위치 매칭
    expect(result.current.filteredEvents.length).toBe(1);
    expect(result.current.filteredEvents[0].id).toBe('2');
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  // 월간 뷰 테스트 - 5월 전체 이벤트 (5개)
  const { result: monthResult } = renderHook(() => 
    useSearch(dummyEvents, currentDate, monthView)
  );
  expect(monthResult.current.filteredEvents.length).toBe(5);
  
  // 주간 뷰 테스트 - 5월 21일이 속한 주간의 이벤트만 (3개 정도)
  const { result: weekResult } = renderHook(() => 
    useSearch(dummyEvents, currentDate, weekView)
  );
  // 주간 뷰에서는 해당 주에 포함된 이벤트만 반환해야 함
  expect(weekResult.current.filteredEvents.length).toBeLessThan(dummyEvents.length);
  // 최소한 '점심 약속'(21일)과 '운동'(22일)은 포함되어야 함
  expect(weekResult.current.filteredEvents.some(e => e.id === '2')).toBe(true);
  expect(weekResult.current.filteredEvents.some(e => e.id === '5')).toBe(true);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(dummyEvents, currentDate, monthView));
  
  // '회의'로 검색
  act(() => {
    result.current.setSearchTerm('회의');
  });
  
  // '회의' 결과 검증
  expect(result.current.searchTerm).toBe('회의');
  expect(result.current.filteredEvents.length).toBe(1);
  expect(result.current.filteredEvents[0].id).toBe('1');
  
  // '점심'으로 검색어 변경
  act(() => {
    result.current.setSearchTerm('점심');
  });
  
  // '점심' 결과 검증
  expect(result.current.searchTerm).toBe('점심');
  expect(result.current.filteredEvents.length).toBe(1);
  expect(result.current.filteredEvents[0].id).toBe('2');
});
