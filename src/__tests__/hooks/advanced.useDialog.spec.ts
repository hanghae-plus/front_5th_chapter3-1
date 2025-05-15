import { renderHook, act } from '@testing-library/react';
import { useDialog } from '../../hooks/useDialog';
import { Event } from '../../types';

describe('useDialog Hook 테스트', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Test Event 1',
      date: '2023-05-15',
      startTime: '10:00',
      endTime: '11:00',
      description: 'Test description',
      location: 'Test location',
      category: 'Test category',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    },
    {
      id: '2',
      title: 'Test Event 2',
      date: '2023-05-15',
      startTime: '11:30',
      endTime: '12:30',
      description: 'Test description 2',
      location: 'Test location 2',
      category: 'Test category 2',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
  ];

  it('초기 상태에서는 dialog가 닫혀있어야 한다', () => {
    const { result } = renderHook(() => useDialog());

    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
    expect(result.current.cancelRef.current).toBeNull();
  });

  it('openDialog 함수를 호출하면 dialog가 열리고 overlappingEvents가 설정되어야 한다', () => {
    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.openDialog(mockEvents);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual(mockEvents);
  });

  it('closeDialog 함수를 호출하면 dialog가 닫혀야 한다', () => {
    const { result } = renderHook(() => useDialog());

    // 먼저 열고
    act(() => {
      result.current.openDialog(mockEvents);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);

    // 닫기
    act(() => {
      result.current.closeDialog();
    });

    expect(result.current.isOverlapDialogOpen).toBe(false);
    // 닫힌 후에도 overlappingEvents는 유지되어야 한다 (데이터 손실 방지)
    expect(result.current.overlappingEvents).toEqual(mockEvents);
  });

  it('다른 이벤트를 전달하여 openDialog를 다시 호출하면 overlappingEvents가 업데이트 되어야 한다', () => {
    const { result } = renderHook(() => useDialog());

    // 첫 번째 이벤트로 dialog 열기
    act(() => {
      result.current.openDialog([mockEvents[0]]);
    });

    expect(result.current.overlappingEvents).toEqual([mockEvents[0]]);

    // 두 번째 이벤트로 dialog 열기
    act(() => {
      result.current.openDialog([mockEvents[1]]);
    });

    expect(result.current.overlappingEvents).toEqual([mockEvents[1]]);
  });
});
