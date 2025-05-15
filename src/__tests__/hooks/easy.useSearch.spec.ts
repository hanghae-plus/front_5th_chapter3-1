import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { createTestEvent } from '../helpers/event.ts';

const events = [
  createTestEvent({
    id: '1',
    title: '주간 회의',
    date: '2025-07-01',
    description: '스쿼드 주간 회의',
    location: '회의실 A',
  }),
  createTestEvent({
    id: '2',
    title: '점심 식사',
    date: '2025-07-03',
    description: '팀 점심 식사',
    location: '진미 평양 냉면',
  }),
  createTestEvent({
    id: '3',
    title: '스프린트 회의',
    date: '2025-07-10',
    description: '스프린트 계획',
    location: '회의실 B',
  }),
  createTestEvent({
    id: '4',
    title: '휴가 계획',
    date: '2025-07-15',
    description: '여름 휴가 계획',
    location: '회의실 C',
  }),
  createTestEvent({
    id: '5',
    title: '주간 회의',
    date: '2025-07-30',
    description: '챕터 주간 회의',
    location: '회의실 A',
  }),
  createTestEvent({
    id: '6',
    title: '면접',
    date: '2025-08-02',
    description: '면접 준비',
    location: '회의실 A',
  }),
];

const currentDate = new Date('2025-07-15');
const view = 'month';

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, currentDate, view));

  expect(result.current.filteredEvents).toHaveLength(5);
  expect(result.current.filteredEvents).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: '1' }),
      expect.objectContaining({ id: '2' }),
      expect.objectContaining({ id: '3' }),
      expect.objectContaining({ id: '4' }),
      expect.objectContaining({ id: '5' }),
    ])
  );
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, currentDate, view));

  act(() => {
    result.current.setSearchTerm('주간 회의');
  });

  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: '1', title: '주간 회의' }),
      expect.objectContaining({ id: '5', title: '주간 회의' }),
    ])
  );
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, currentDate, view));

  act(() => {
    result.current.setSearchTerm('점심 식사');
  });

  expect(result.current.filteredEvents).toEqual(
    expect.arrayContaining([expect.objectContaining({ id: '2', title: '점심 식사' })])
  );

  act(() => {
    result.current.setSearchTerm('계획');
  });

  expect(result.current.filteredEvents).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: '3', description: '스프린트 계획' }),
      expect.objectContaining({ id: '4', description: '여름 휴가 계획' }),
    ])
  );

  act(() => {
    result.current.setSearchTerm('C');
  });

  expect(result.current.filteredEvents).toEqual(
    expect.arrayContaining([expect.objectContaining({ id: '4', location: '회의실 C' })])
  );
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result: monthResult } = renderHook(() => useSearch(events, currentDate, 'month'));

  expect(monthResult.current.filteredEvents).toHaveLength(5);
  expect.arrayContaining([
    expect.objectContaining({ id: '1' }),
    expect.objectContaining({ id: '2' }),
    expect.objectContaining({ id: '3' }),
    expect.objectContaining({ id: '4' }),
    expect.objectContaining({ id: '5' }),
  ]);

  const { result: weekResult } = renderHook(() => useSearch(events, currentDate, 'week'));

  expect(weekResult.current.filteredEvents).toHaveLength(1);
  expect(weekResult.current.filteredEvents).toEqual(
    expect.arrayContaining([expect.objectContaining({ id: '4', date: '2025-07-15' })])
  );
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(events, currentDate, view));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: '1', title: '주간 회의' }),
      expect.objectContaining({ id: '3', title: '스프린트 회의' }),
    ])
  );

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual(
    expect.arrayContaining([expect.objectContaining({ id: '2', title: '점심 식사' })])
  );
});
