import { act, renderHook } from '@testing-library/react';

import { useOverlappingEvent } from '../../hooks/useOverlappingEvent';
import { Event } from '../../types';
describe('useOverlappingEvent', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '테스트 이벤트 1',
      date: '2024-03-20',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
      description: '테스트 이벤트 1 설명',
      location: '테스트 이벤트 1 위치',
    },
    {
      id: '2',
      title: '테스트 이벤트 2',
      date: '2024-03-20',
      startTime: '11:00',
      endTime: '12:00',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
      description: '테스트 이벤트 2 설명',
      location: '테스트 이벤트 2 위치',
    },
  ];
  it('setIsOverlapDialogOpen으로 다이얼로그 상태를 변경할 수 있다', async () => {
    const { result } = renderHook(() => useOverlappingEvent());

    await act(() => {
      result.current.setIsOverlapDialogOpen(true);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);

    await act(() => {
      result.current.setIsOverlapDialogOpen(false);
    });

    expect(result.current.isOverlapDialogOpen).toBe(false);
  });

  it('setOverlappingEvents로 중복 이벤트를 설정할 수 있다', async () => {
    const { result } = renderHook(() => useOverlappingEvent());

    await act(() => {
      result.current.setOverlappingEvents(mockEvents);
    });

    expect(result.current.overlappingEvents).toEqual(mockEvents);
    expect(result.current.overlappingEvents.length).toBe(2);
  });
});
