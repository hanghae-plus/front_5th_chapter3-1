// src/__tests__/hooks/useEventForm.spec.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';

import { setupMockHandlerUpdating } from '@/__mocks__/handlersUtils';
import { RootProvider as wrapper } from '@/app/providers/RootProvider';
import { Event, RepeatType } from '@/entities/event/model/types';
import { useEventForm } from '@/entities/event/model/useEventForm';

describe('useEventForm', () => {
  const event: Event = {
    id: '1',
    title: '미팅',
    date: '2024-03-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 미팅',
    location: '회의실',
    category: '업무',
    repeat: {
      type: 'none' as RepeatType,
      interval: 1,
    },
    notificationTime: 10,
  };

  it('수정 버튼을 누르면 폼이 수정 모드로 전환되어야 한다', () => {
    const { result } = renderHook(() => useEventForm(), { wrapper });

    act(() => {
      result.current.editEvent(event);
    });

    expect(result.current.editingEvent).toBe(event);
    expect(result.current.title).toBe('미팅');
    expect(result.current.date).toBe('2024-03-20');
    expect(result.current.startTime).toBe('10:00');
    expect(result.current.endTime).toBe('11:00');
    expect(result.current.description).toBe('팀 미팅');
    expect(result.current.location).toBe('회의실');
    expect(result.current.category).toBe('업무');
  });

  it('시작 시간을 변경하면 시간 유효성 검사가 수행되어야 한다', () => {
    const { result } = renderHook(() => useEventForm(), { wrapper });

    act(() => {
      result.current.handleStartTimeChange({
        target: { value: '11:00' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleEndTimeChange({
        target: { value: '10:00' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    waitFor(() => {
      expect(result.current.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
      expect(result.current.endTimeError).toBe('종료 시간은 시작 시간보다 늦어야 합니다.');
    });
  });

  it('일정 중복 시 중복 경고 모달 표시되어야 한다', async () => {
    setupMockHandlerUpdating();
    const { result } = renderHook(() => useEventForm(), { wrapper });

    // 중복되는 일정 설정
    act(() => {
      result.current.setTitle('새 미팅');
      result.current.setDate('2025-10-15');
      result.current.setStartTime('10:30');
      result.current.setEndTime('11:30');
    });

    act(() => {
      result.current.addOrUpdateEvent();
    });

    waitFor(() => {
      expect(result.current.isOverlapDialogOpen).toBe(true);
      expect(result.current.overlappingEvents.length).toBeGreaterThan(0);
    });
  });

  it('반복 설정을 활성화하면 관련 필드들이 활성화되어야 한다', () => {
    const { result } = renderHook(() => useEventForm(), { wrapper });

    act(() => {
      result.current.setIsRepeating(true);
      result.current.setRepeatType('weekly');
      result.current.setRepeatInterval(2);
      result.current.setRepeatEndDate('2025-10-20');
    });

    expect(result.current.isRepeating).toBe(true);
    expect(result.current.repeatType).toBe('weekly');
    expect(result.current.repeatInterval).toBe(2);
    expect(result.current.repeatEndDate).toBe('2025-10-20');
  });
});
