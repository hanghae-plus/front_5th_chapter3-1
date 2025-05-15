import { act, renderHook } from '@testing-library/react';

import { useOverlapDialog } from '../../hooks/useOverlapDialog';
import { Event } from '../../types';

describe('useOverlapDialog', () => {
  it('초기 상태를 올바르게 반환해야 합니다.', () => {
    const { result } = renderHook(() => useOverlapDialog());

    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('openOverlapDialog를 호출하면 isOverlapDialogOpen이 true가 되고 overlappingEvents가 설정되어야 합니다.', () => {
    const { result } = renderHook(() => useOverlapDialog());
    const testEvents: Event[] = [
      {
        id: '1',
        title: 'Test Event',
        date: '2024-01-01',
        startTime: '10:00',
        endTime: '11:00',
        notificationTime: 10,
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
      },
    ];

    act(() => {
      result.current.openOverlapDialog(testEvents);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual(testEvents);
  });

  it('closeOverlapDialog를 호출하면 isOverlapDialogOpen이 false가 되고 overlappingEvents는 유지되어야 합니다.', () => {
    const { result } = renderHook(() => useOverlapDialog());
    const testEvents: Event[] = [
      {
        id: '1',
        title: 'Test Event',
        date: '2024-01-01',
        startTime: '10:00',
        endTime: '11:00',
        notificationTime: 10,
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
      },
    ];

    act(() => {
      result.current.openOverlapDialog(testEvents);
    });

    act(() => {
      result.current.closeOverlapDialog();
    });

    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual(testEvents);
  });
});
