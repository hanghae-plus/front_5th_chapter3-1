import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트1',
      description: '이벤트1 설명',
      date: '2025-01-01',
      startTime: '10:00',
      endTime: '11:00',
      location: '서울',
      notificationTime: 10,
      category: '회의',
      repeat: {
        type: 'daily',
        interval: 1,
      },
    },
  ];
  const { result } = renderHook(() => useSearch(events, new Date('2025-01-01'), 'month'));
  console.log('filteredEvents', result.current.filteredEvents);
  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트1',
      description: '이벤트1 설명',
      date: '2025-01-01',
      startTime: '10:00',
      endTime: '11:00',
      location: '서울',
      notificationTime: 10,
      category: '회의',
      repeat: {
        type: 'daily',
        interval: 1,
      },
    },
  ];
  const { result } = renderHook(() => useSearch(events, new Date('2025-01-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('이벤트1');
  });
  expect(result.current.filteredEvents).toEqual([events[0]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트1',
      description: '이벤트1 설명',
      date: '2025-01-01',
      startTime: '10:00',
      endTime: '11:00',
      location: '서울',
      notificationTime: 10,
      category: '회의',
      repeat: {
        type: 'daily',
        interval: 1,
      },
    },
  ];
  const { result } = renderHook(() => useSearch(events, new Date('2025-01-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('이벤트1');
  });
  expect(result.current.filteredEvents).toEqual([events[0]]);

  act(() => {
    result.current.setSearchTerm('이벤트1 설명');
  });
  expect(result.current.filteredEvents).toEqual([events[0]]);

  act(() => {
    result.current.setSearchTerm('서울');
  });
  expect(result.current.filteredEvents).toEqual([events[0]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '1월 1일 이벤트',
      description: '첫째 주 이벤트',
      date: '2025-01-01', // 1월 1일 (첫째 주)
      startTime: '10:00',
      endTime: '11:00',
      location: '서울',
      notificationTime: 10,
      category: '회의',
      repeat: {
        type: 'none',
        interval: 0,
      },
    },
    {
      id: '2',
      title: '1월 15일 이벤트',
      description: '셋째 주 이벤트',
      date: '2025-01-15', // 1월 15일 (셋째 주)
      startTime: '14:00',
      endTime: '15:00',
      location: '부산',
      notificationTime: 10,
      category: '미팅',
      repeat: {
        type: 'none',
        interval: 0,
      },
    },
    {
      id: '3',
      title: '2월 1일 이벤트',
      description: '다음 달 이벤트',
      date: '2025-02-01', // 2월 1일
      startTime: '09:00',
      endTime: '10:00',
      location: '대전',
      notificationTime: 10,
      category: '세미나',
      repeat: {
        type: 'none',
        interval: 0,
      },
    },
  ];
  // 1. 월간 뷰 테스트 (1월)
  const { result: monthResult } = renderHook(() =>
    useSearch(events, new Date('2025-01-10'), 'month')
  );
  expect(monthResult.current.filteredEvents).toEqual([events[0], events[1]]);

  // 2. 주간 뷰 테스트 (1월 1일)
  const { result: weekResult1 } = renderHook(() =>
    useSearch(events, new Date('2025-01-01'), 'week')
  );
  expect(weekResult1.current.filteredEvents).toEqual([events[0]]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  // 다양한 키워드가 포함된 이벤트 배열 생성
  const events: Event[] = [
    {
      id: '1',
      title: '주간 회의',
      description: '팀 회의 진행',
      date: '2025-01-01',
      startTime: '10:00',
      endTime: '11:00',
      location: '회의실 A',
      notificationTime: 10,
      category: '회의',
      repeat: {
        type: 'none',
        interval: 0,
      },
    },
    {
      id: '2',
      title: '점심 식사',
      description: '팀원들과 점심 식사',
      date: '2025-01-01',
      startTime: '12:00',
      endTime: '13:00',
      location: '구내 식당',
      notificationTime: 10,
      category: '식사',
      repeat: {
        type: 'none',
        interval: 0,
      },
    },
  ];

  const { result } = renderHook(() => useSearch(events, new Date('2025-01-01'), 'month'));
  expect(result.current.filteredEvents).toEqual(events);

  // 1. '회의' 검색어 설정
  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toEqual([events[0]]);

  // 2. '점심' 검색어 설정
  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents).toEqual([events[1]]);
});
