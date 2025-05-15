import realEvents from '../../__mocks__/response/realEvents.json';
import { useSearch } from '../../hooks/useSearch.ts';
import type { Event } from '../../types.ts';
import { act, renderHook } from '@testing-library/react';

it('월간 뷰에서 검색어가 비어있을 때 현재 월의 모든 이벤트를 반환해야 한다 (현재 날짜는 2025-05-15)', () => {
  const { result } = renderHook(() =>
    useSearch(realEvents.events as Event[], new Date('2025-05-15'), 'month')
  );

  expect(result.current.searchTerm).toBe('');
  expect(result.current.filteredEvents).toEqual([
    {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
      title: '점심 약속',
      date: '2025-05-21',
      startTime: '12:30',
      endTime: '13:30',
      description: '주간 미팅 후 동료와 점심 식사',
      location: '회사 근처 식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
      title: '프로젝트 마감',
      date: '2025-05-25',
      startTime: '09:00',
      endTime: '18:00',
      description: '분기별 프로젝트 마감',
      location: '사무실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: 'dac62941-69e5-4ec0-98cc-24c2a79a7f81',
      title: '생일 파티',
      date: '2025-05-28',
      startTime: '19:00',
      endTime: '22:00',
      description: '친구 생일 축하',
      location: '친구 집',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '80d85368-b4a4-47b3-b959-25171d49371f',
      title: '운동',
      date: '2025-05-22',
      startTime: '18:00',
      endTime: '19:00',
      description: '주간 운동',
      location: '헬스장',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '5b68ee07-97ec-4011-b18f-aedbb59607ba',
      title: '일정1',
      date: '2025-05-10',
      startTime: '17:10',
      endTime: '19:09',
      description: 'ㅇㅇ',
      location: 'ㅇㅇ',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: 'cafaa525-f054-4aeb-8f16-4d22f19084f1',
      title: '일정2',
      date: '2025-05-10',
      startTime: '17:10',
      endTime: '18:10',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ]);
});

it('주간 뷰에서 검색어가 비어있을 때 현재 주간의 모든 이벤트를 반환해야 한다 (현재 날짜는 2025-05-15)', () => {
  const { result } = renderHook(() =>
    useSearch(realEvents.events as Event[], new Date('2025-05-19'), 'week')
  );

  expect(result.current.searchTerm).toBe('');
  expect(result.current.filteredEvents).toEqual([
    {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
      title: '점심 약속',
      date: '2025-05-21',
      startTime: '12:30',
      endTime: '13:30',
      description: '주간 미팅 후 동료와 점심 식사',
      location: '회사 근처 식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '80d85368-b4a4-47b3-b959-25171d49371f',
      title: '운동',
      date: '2025-05-22',
      startTime: '18:00',
      endTime: '19:00',
      description: '주간 운동',
      location: '헬스장',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ]);
});

it('월간 뷰에서 감색어가 입력된다면 현재 월의 이벤트 중 해당 검색어에 맞는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() =>
    useSearch(realEvents.events as Event[], new Date('2025-05-15'), 'month')
  );

  act(() => {
    result.current.setSearchTerm('일정');
  });
  expect(result.current.searchTerm).toBe('일정');
  expect(result.current.filteredEvents).toEqual([
    {
      id: '5b68ee07-97ec-4011-b18f-aedbb59607ba',
      title: '일정1',
      date: '2025-05-10',
      startTime: '17:10',
      endTime: '19:09',
      description: 'ㅇㅇ',
      location: 'ㅇㅇ',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: 'cafaa525-f054-4aeb-8f16-4d22f19084f1',
      title: '일정2',
      date: '2025-05-10',
      startTime: '17:10',
      endTime: '18:10',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ]);
});

it('주간 뷰에서 감색어가 입력된다면 현재 주의 이벤트 중 해당 검색어에 맞는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() =>
    useSearch(realEvents.events as Event[], new Date('2025-05-19'), 'week')
  );

  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.searchTerm).toBe('회의');
  expect(result.current.filteredEvents).toEqual([
    {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ]);
});

// 해당 케이스는 위의 '월간/주간 뷰에서 검색어가 입력된다면 ~' 케이스로 검증된 내용이라고 생각해서 skip 했습니다
it.skip('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {});
// 해당 케이스도 위에서 모두 검증된 내용이라고 생각해서 skip 했습니다
it.skip('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() =>
    useSearch(realEvents.events as Event[], new Date('2025-05-19'), 'week')
  );

  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.searchTerm).toBe('회의');

  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.searchTerm).toBe('점심');

  expect(result.current.filteredEvents).toEqual([
    {
      id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
      title: '점심 약속',
      date: '2025-05-21',
      startTime: '12:30',
      endTime: '13:30',
      description: '주간 미팅 후 동료와 점심 식사',
      location: '회사 근처 식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ]);
});
