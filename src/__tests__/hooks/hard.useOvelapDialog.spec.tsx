import { renderHook, act } from '@testing-library/react';

import { useOverlapDialog } from '../../hooks/useOverlapDialog';
import { Event } from '../../types';

describe('useOverlapDialog', () => {
  const mockEvent: Event = {
    id: '1',
    title: '테스트 일정',
    date: '2025-05-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  };

  it('초기 상태는 다이얼로그가 닫혀있고 겹치는 이벤트가 없어야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());

    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('다이얼로그를 열고 닫을 수 있어야 한다', () => {
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

  it('겹치는 이벤트를 설정하고 초기화할 수 있어야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());

    act(() => {
      result.current.setOverlappingEvents([mockEvent]);
    });
    expect(result.current.overlappingEvents).toEqual([mockEvent]);

    act(() => {
      result.current.setOverlappingEvents([]);
    });
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('여러 개의 겹치는 이벤트를 관리할 수 있어야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());
    const mockEvents: Event[] = [
      mockEvent,
      {
        ...mockEvent,
        id: '2',
        title: '테스트 일정 2',
        startTime: '10:30',
        endTime: '11:30',
      },
    ];

    act(() => {
      result.current.setOverlappingEvents(mockEvents);
    });
    expect(result.current.overlappingEvents).toHaveLength(2);
    expect(result.current.overlappingEvents[0].id).toBe('1');
    expect(result.current.overlappingEvents[1].id).toBe('2');
  });

  it('다이얼로그 상태와 겹치는 이벤트를 동시에 관리할 수 있어야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());

    act(() => {
      result.current.setIsOverlapDialogOpen(true);
      result.current.setOverlappingEvents([mockEvent]);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual([mockEvent]);

    act(() => {
      result.current.setIsOverlapDialogOpen(false);
      result.current.setOverlappingEvents([]);
    });

    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });
});
