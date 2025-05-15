import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

import { Event, RepeatType } from '../../types';
import { useEventSubmission } from '../useEventSubmission';

describe('useEventSubmission', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2024-03-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    },
  ];

  const mockSaveEvent = vi.fn();
  const mockResetForm = vi.fn();
  const mockSetIsOverlapDialogOpen = vi.fn();
  const mockSetOverlappingEvents = vi.fn();

  const defaultProps = {
    events: mockEvents,
    saveEvent: mockSaveEvent,
    resetForm: mockResetForm,
    setIsOverlapDialogOpen: mockSetIsOverlapDialogOpen,
    setOverlappingEvents: mockSetOverlappingEvents,
  };

  const mockEventData = {
    title: '새로운 회의',
    date: '2024-03-20',
    startTime: '09:00',
    endTime: '10:00',
    description: '새로운 주간 정기 회의',
    location: '회의실 B',
    category: '업무',
    isRepeating: false,
    repeatType: 'none' as RepeatType,
    repeatInterval: 1,
    repeatEndDate: '',
    notificationTime: 30,
    startTimeError: null,
    endTimeError: null,
    editingEvent: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addOrUpdateEvent', () => {
    it('필수 필드가 누락된 경우 이벤트를 저장하지 않는다', async () => {
      const { result } = renderHook(() => useEventSubmission(defaultProps));

      await act(async () => {
        await result.current.addOrUpdateEvent({
          ...mockEventData,
          title: '',
        });
      });

      expect(mockSaveEvent).not.toHaveBeenCalled();
      expect(mockResetForm).not.toHaveBeenCalled();
    });

    it('시간 에러가 있는 경우 이벤트를 저장하지 않는다', async () => {
      const { result } = renderHook(() => useEventSubmission(defaultProps));

      await act(async () => {
        await result.current.addOrUpdateEvent({
          ...mockEventData,
          startTimeError: '시간 형식이 올바르지 않습니다',
        });
      });

      expect(mockSaveEvent).not.toHaveBeenCalled();
      expect(mockResetForm).not.toHaveBeenCalled();
    });

    it('중복이 없는 경우 이벤트를 저장하고 폼을 초기화한다', async () => {
      const { result } = renderHook(() => useEventSubmission(defaultProps));

      await act(async () => {
        await result.current.addOrUpdateEvent(mockEventData);
      });

      expect(mockSaveEvent).toHaveBeenCalledWith({
        title: mockEventData.title,
        date: mockEventData.date,
        startTime: mockEventData.startTime,
        endTime: mockEventData.endTime,
        description: mockEventData.description,
        location: mockEventData.location,
        category: mockEventData.category,
        repeat: {
          type: 'none',
          interval: 1,
        },
        notificationTime: mockEventData.notificationTime,
      });
      expect(mockResetForm).toHaveBeenCalled();
    });

    it('중복된 이벤트가 있는 경우 중복 다이얼로그를 표시한다', async () => {
      const overlappingEvent = {
        ...mockEventData,
        startTime: '10:00',
        endTime: '11:00',
      };

      const { result } = renderHook(() => useEventSubmission(defaultProps));

      await act(async () => {
        await result.current.addOrUpdateEvent(overlappingEvent);
      });

      expect(mockSetOverlappingEvents).toHaveBeenCalled();
      expect(mockSetIsOverlapDialogOpen).toHaveBeenCalledWith(true);
      expect(mockSaveEvent).not.toHaveBeenCalled();
      expect(mockResetForm).not.toHaveBeenCalled();
    });
  });

  describe('handleOverlapConfirm', () => {
    it('중복 확인 시 이벤트를 저장하고 다이얼로그를 닫는다', async () => {
      const { result } = renderHook(() => useEventSubmission(defaultProps));

      await act(async () => {
        await result.current.handleOverlapConfirm(mockEventData);
      });

      expect(mockSetIsOverlapDialogOpen).toHaveBeenCalledWith(false);
      expect(mockSaveEvent).toHaveBeenCalledWith({
        title: mockEventData.title,
        date: mockEventData.date,
        startTime: mockEventData.startTime,
        endTime: mockEventData.endTime,
        description: mockEventData.description,
        location: mockEventData.location,
        category: mockEventData.category,
        repeat: {
          type: 'none',
          interval: 1,
        },
        notificationTime: mockEventData.notificationTime,
      });
    });

    it('이벤트 수정 시 기존 ID를 유지한다', async () => {
      const editingEvent = {
        ...mockEventData,
        editingEvent: mockEvents[0],
      };

      const { result } = renderHook(() => useEventSubmission(defaultProps));

      await act(async () => {
        await result.current.addOrUpdateEvent(editingEvent);
      });

      expect(mockSaveEvent).toHaveBeenCalledWith({
        id: '1',
        title: editingEvent.title,
        date: editingEvent.date,
        startTime: editingEvent.startTime,
        endTime: editingEvent.endTime,
        description: editingEvent.description,
        location: editingEvent.location,
        category: editingEvent.category,
        repeat: {
          type: 'none',
          interval: 1,
        },
        notificationTime: editingEvent.notificationTime,
      });
    });
  });
});
