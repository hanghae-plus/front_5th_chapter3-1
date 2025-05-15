import { renderHook, act } from '@testing-library/react';

import { useOverlappingEventDialog } from '../../hooks/useOverlappingEventDialog';
import { Event } from '../../types';

describe('useOverlappingEventDialog', () => {
  const mockEvent: Event = {
    id: '1',
    title: '테스트 일정',
    date: '2025-05-16',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  };

  it('초기 상태는 닫힌 상태이며 데이터가 없음', () => {
    const { result } = renderHook(() => useOverlappingEventDialog({ onConfirmSave: vi.fn() }));

    expect(result.current.isOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('openDialog 호출 시 상태가 열리고 데이터가 설정됨', () => {
    const { result } = renderHook(() => useOverlappingEventDialog({ onConfirmSave: vi.fn() }));

    act(() => {
      result.current.openDialog([mockEvent], mockEvent);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual([mockEvent]);
  });

  it('closeDialog 호출 시 상태 초기화됨', () => {
    const { result } = renderHook(() => useOverlappingEventDialog({ onConfirmSave: vi.fn() }));

    act(() => {
      result.current.openDialog([mockEvent], mockEvent);
      result.current.closeDialog();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('confirm 호출 시 onConfirmSave가 호출되고 상태가 닫힘', async () => {
    const onConfirmSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useOverlappingEventDialog({ onConfirmSave }));

    act(() => {
      result.current.openDialog([mockEvent], mockEvent);
    });

    await act(async () => {
      await result.current.confirm();
    });

    expect(onConfirmSave).toHaveBeenCalledWith(mockEvent);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });
});
