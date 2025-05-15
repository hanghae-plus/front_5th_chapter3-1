import { renderHook, act } from '@testing-library/react';

import { useOverlapDialog } from '../../hooks/useOverlapDialog';
import { Event } from '../../types';

describe('useOverlapDialog Hook', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2025-05-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '5월 정기 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '프로젝트 미팅',
      date: '2025-05-15',
      startTime: '10:30',
      endTime: '11:30',
      description: '프로젝트 진행상황 공유',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    },
  ];

  it('초기 상태가 올바른지 확인', () => {
    const { result } = renderHook(() => useOverlapDialog());

    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
    expect(result.current.cancelRef.current).toBeNull();
  });

  it('openOverlapDialog 함수가 상태를 올바르게 업데이트하는지 확인', () => {
    const { result } = renderHook(() => useOverlapDialog());

    act(() => {
      result.current.openOverlapDialog(mockEvents);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual(mockEvents);
  });

  it('closeOverlapDialog 함수가 상태를 올바르게 업데이트하는지 확인', () => {
    const { result } = renderHook(() => useOverlapDialog());

    // 먼저 다이얼로그 열기
    act(() => {
      result.current.openOverlapDialog(mockEvents);
    });

    // 다이얼로그 닫기
    act(() => {
      result.current.closeOverlapDialog();
    });

    expect(result.current.isOverlapDialogOpen).toBe(false);
  });

  it('setIsOverlapDialogOpen 함수가 상태를 올바르게 업데이트하는지 확인', () => {
    const { result } = renderHook(() => useOverlapDialog());

    act(() => {
      result.current.setIsOverlapDialogOpen(true);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);

    act(() => {
      result.current.setIsOverlapDialogOpen(false);
    });

    expect(result.current.isOverlapDialogOpen).toBe(false);
  });

  it('cancelRef가 올바르게 생성되는지 확인', () => {
    const { result } = renderHook(() => useOverlapDialog());
    expect(result.current.cancelRef).toBeDefined();
  });

  it('전체 워크플로우가 올바르게 동작하는지 확인', () => {
    const { result } = renderHook(() => useOverlapDialog());

    // 초기 상태 확인
    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);

    // 다이얼로그 열기
    act(() => {
      result.current.openOverlapDialog(mockEvents);
    });

    // 상태 변경 확인
    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual(mockEvents);

    // 다이얼로그 닫기
    act(() => {
      result.current.closeOverlapDialog();
    });

    // 최종 상태 확인
    expect(result.current.isOverlapDialogOpen).toBe(false);
  });
});
