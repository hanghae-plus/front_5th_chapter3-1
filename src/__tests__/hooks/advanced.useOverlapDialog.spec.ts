import { act, renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useOverlapDialog } from '../../hooks/useOverlapDialog';
import { Event } from '../../types';

describe('useOverlapDialog 훅', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '테스트 일정',
      date: '2025-05-04',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('초기 상태는 닫힌 상태여야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());

    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('openOverlapDialog 함수는 대화상자를 열고 이벤트를 설정해야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());

    act(() => {
      result.current.openOverlapDialog(mockEvents);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual(mockEvents);
  });

  it('closeOverlapDialog 함수는 대화상자를 닫아야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());

    act(() => {
      result.current.openOverlapDialog(mockEvents);
    });

    act(() => {
      result.current.closeOverlapDialog();
    });

    expect(result.current.isOverlapDialogOpen).toBe(false);
  });

  it('cancelRef는 정의되어 있어야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());

    expect(result.current.cancelRef).toBeDefined();
  });

  it('openOverlapDialog는 빈 이벤트 배열로도 동작해야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());

    act(() => {
      result.current.openOverlapDialog([]);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('여러 번 열고 닫는 작업이 일관되게 동작해야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());

    act(() => {
      result.current.openOverlapDialog(mockEvents);
    });
    act(() => {
      result.current.closeOverlapDialog();
    });

    act(() => {
      result.current.openOverlapDialog(mockEvents);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);

    act(() => {
      result.current.closeOverlapDialog();
    });

    expect(result.current.isOverlapDialogOpen).toBe(false);
  });

  it('다른 이벤트 배열로 대화상자를 열 수 있어야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());

    act(() => {
      result.current.openOverlapDialog(mockEvents);
    });

    expect(result.current.overlappingEvents).toEqual(mockEvents);

    const anotherEvents: Event[] = [
      {
        id: '2',
        title: '다른 일정',
        date: '2025-05-05',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    act(() => {
      result.current.openOverlapDialog(anotherEvents);
    });

    expect(result.current.overlappingEvents).toEqual(anotherEvents);
  });
});
