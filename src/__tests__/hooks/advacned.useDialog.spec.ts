import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';

import { useDialog } from '../../hooks/useDialog';
import type { Event, EventForm, RepeatInfo } from '../../types';
import { findOverlappingEvents } from '../../utils/eventOverlap';

vi.mock('../../utils/eventOverlap', () => ({
  findOverlappingEvents: vi.fn(),
}));

describe('useDialog Hook Test', () => {
  const mockedFindOverlappingEvents = findOverlappingEvents as MockedFunction<
    typeof findOverlappingEvents
  >;

  const mockRepeatInfo: RepeatInfo = {
    type: 'none',
    interval: 1,
  };

  beforeEach(() => {
    mockedFindOverlappingEvents.mockClear();
  });

  it('초기 상태는 isOpen이 false이고 overlappingEvents가 빈 배열이어야 한다.', () => {
    const { result } = renderHook(() => useDialog());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('onOpen을 호출하면 isOpen이 true가 되어야 한다.', () => {
    const { result } = renderHook(() => useDialog());
    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it('onClose를 호출하면 isOpen이 false가 되어야 한다.', () => {
    const { result } = renderHook(() => useDialog());
    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.onClose();
    });
    expect(result.current.isOpen).toBe(false);
  });

  describe('checkOverlap 함수 테스트', () => {
    const mockEventData: EventForm = {
      title: 'Test Event',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: 'Test Description',
      location: 'Test Location',
      category: 'Test Category',
      repeat: mockRepeatInfo,
      notificationTime: 10,
    };
    const mockEvents: Event[] = [{ id: '1', ...mockEventData }];

    it('겹치는 이벤트가 없으면 false를 반환하고 다이얼로그를 열지 않아야 한다.', () => {
      mockedFindOverlappingEvents.mockReturnValue([]);
      const { result } = renderHook(() => useDialog());

      let overlapResult: boolean | undefined;
      act(() => {
        overlapResult = result.current.checkOverlap(mockEventData, mockEvents);
      });

      expect(overlapResult).toBe(false);
      expect(result.current.isOpen).toBe(false);
      expect(result.current.overlappingEvents).toEqual([]);
      expect(mockedFindOverlappingEvents).toHaveBeenCalledWith(mockEventData, mockEvents);
    });

    it('겹치는 이벤트가 있으면 true를 반환하고 다이얼로그를 열고 overlappingEvents를 설정해야 한다.', () => {
      const overlappingEventsMock: Event[] = [
        {
          id: '2',
          title: 'Overlapping Event',
          date: '2025-07-01',
          startTime: '10:30',
          endTime: '11:30',
          description: 'Overlap Description',
          location: 'Overlap Location',
          category: 'Overlap Category',
          repeat: mockRepeatInfo,
          notificationTime: 5,
        },
      ];
      mockedFindOverlappingEvents.mockReturnValue(overlappingEventsMock);
      const { result } = renderHook(() => useDialog());

      let overlapResult: boolean | undefined;
      act(() => {
        overlapResult = result.current.checkOverlap(mockEventData, mockEvents);
      });

      expect(overlapResult).toBe(true);
      expect(result.current.isOpen).toBe(true);
      expect(result.current.overlappingEvents).toEqual(overlappingEventsMock);
      expect(mockedFindOverlappingEvents).toHaveBeenCalledWith(mockEventData, mockEvents);
    });

    it('checkOverlap이 여러 번 호출될 때, 각 호출은 독립적으로 overlappingEvents를 설정해야 한다.', () => {
      const { result } = renderHook(() => useDialog());

      const firstOverlappingEvents: Event[] = [
        {
          id: 'first',
          title: 'First Overlap',
          date: '2025-07-01',
          startTime: '09:00',
          endTime: '10:00',
          description: 'First Description',
          location: 'First Location',
          category: 'First Category',
          repeat: mockRepeatInfo,
          notificationTime: 15,
        },
      ];
      mockedFindOverlappingEvents.mockReturnValueOnce(firstOverlappingEvents);

      act(() => {
        result.current.checkOverlap(mockEventData, mockEvents);
      });
      expect(result.current.isOpen).toBe(true);
      expect(result.current.overlappingEvents).toEqual(firstOverlappingEvents);

      mockedFindOverlappingEvents.mockReturnValueOnce([]);
      act(() => {
        result.current.onClose();
      });
      expect(result.current.isOpen).toBe(false);
      expect(result.current.overlappingEvents).toEqual(firstOverlappingEvents);

      let secondOverlapResult: boolean | undefined;
      act(() => {
        secondOverlapResult = result.current.checkOverlap(mockEventData, mockEvents);
      });

      expect(secondOverlapResult).toBe(false);
      expect(result.current.isOpen).toBe(false);
      expect(result.current.overlappingEvents).toEqual(firstOverlappingEvents);

      const newOverlappingEvents: Event[] = [
        {
          id: 'new',
          title: 'New Overlap',
          date: '2025-07-01',
          startTime: '10:30',
          endTime: '11:30',
          description: 'New Description',
          location: 'New Location',
          category: 'New Category',
          repeat: mockRepeatInfo,
          notificationTime: 20,
        },
      ];
      mockedFindOverlappingEvents.mockReturnValueOnce(newOverlappingEvents);

      let thirdOverlapResult: boolean | undefined;
      act(() => {
        thirdOverlapResult = result.current.checkOverlap(mockEventData, mockEvents);
      });

      expect(thirdOverlapResult).toBe(true);
      expect(result.current.isOpen).toBe(true);
      expect(result.current.overlappingEvents).toEqual(newOverlappingEvents);
    });
  });
});
