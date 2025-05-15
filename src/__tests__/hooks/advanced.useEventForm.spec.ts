import { renderHook, act } from '@testing-library/react';
import { useEventForm } from '@/hooks/useEventForm';
import { Event, RepeatType } from '@/types';
import { vi } from 'vitest';

// getTimeErrorMessage 모킹
vi.mock('@/utils', () => ({
  getTimeErrorMessage: vi.fn().mockImplementation((startTime, endTime) => {
    if (startTime > endTime) {
      return {
        startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
        endTimeError: null,
      };
    }
    return {
      startTimeError: null,
      endTimeError: null,
    };
  }),
}));

describe('useEventForm 훅 테스트', () => {
  const mockEvent: Event = {
    id: '1',
    title: 'Test Event',
    date: '2023-05-15',
    startTime: '10:00',
    endTime: '11:00',
    description: 'Test description',
    location: 'Test location',
    category: 'Test category',
    repeat: { type: 'none' as RepeatType, interval: 0 },
    notificationTime: 30,
  };

  it('기본 상태가 올바르게 초기화되어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    // 기본 상태 검증
    expect(result.current.title).toBe('');
    expect(result.current.date).toBe('');
    expect(result.current.startTime).toBe('');
    expect(result.current.endTime).toBe('');
    expect(result.current.description).toBe('');
    expect(result.current.location).toBe('');
    expect(result.current.category).toBe('');
    expect(result.current.isRepeating).toBe(true);
    expect(result.current.repeatType).toBe('none');
    expect(result.current.repeatInterval).toBe(1);
    expect(result.current.repeatEndDate).toBe('');
    expect(result.current.notificationTime).toBe(10);

    // startTimeError, endTimeError 검증
    expect(result.current.startTimeError).toBeNull();
    expect(result.current.endTimeError).toBeNull();

    // editingEvent 검증
    expect(result.current.editingEvent).toBeNull();
  });

  it('handleFormChange가 폼 필드를 올바르게 업데이트해야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    // title 필드 변경
    act(() => {
      result.current.handleFormChange('title', 'New Title');
    });

    // title 변경 검증
    expect(result.current.title).toBe('New Title');

    // 여러 필드 변경 테스트
    act(() => {
      result.current.handleFormChange('date', '2023-06-20');
      result.current.handleFormChange('description', 'New Description');
      result.current.handleFormChange('isRepeating', true);
      result.current.handleFormChange('repeatType', 'daily');
    });

    // 변경 검증
    expect(result.current.date).toBe('2023-06-20');
    expect(result.current.description).toBe('New Description');
    expect(result.current.isRepeating).toBe(true);
    expect(result.current.repeatType).toBe('daily');
  });

  it('handleStartTimeChange가 시작 시간을 업데이트하고 오류를 적절히 설정해야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    // 종료 시간 먼저 설정
    act(() => {
      result.current.handleFormChange('endTime', '15:00');
    });

    // 시작 시간을 종료 시간보다 늦게 설정하여 오류 발생
    const mockEvent = {
      target: { value: '16:00' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleStartTimeChange(mockEvent);
    });

    // 시작 시간이 업데이트되었는지 검증
    expect(result.current.startTime).toBe('16:00');

    // 시작 시간이 종료 시간보다 늦으므로 오류가 발생해야 함
    expect(result.current.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
    expect(result.current.endTimeError).toBeNull();
  });

  it('handleEndTimeChange가 종료 시간을 업데이트하고 오류를 적절히 설정해야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    // 시작 시간 설정
    act(() => {
      result.current.handleFormChange('startTime', '14:00');
    });

    // 종료 시간을 설정
    const mockEvent = {
      target: { value: '13:00' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleEndTimeChange(mockEvent);
    });

    // 종료 시간이 업데이트되었는지 검증
    expect(result.current.endTime).toBe('13:00');

    // 종료 시간이 시작 시간보다 빠르므로 오류가 발생해야 함
    expect(result.current.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
    expect(result.current.endTimeError).toBeNull();
  });

  it('resetForm이 폼 상태를 초기화해야 한다', () => {
    const { result } = renderHook(() => useEventForm(mockEvent));

    // 폼이 초기 이벤트로 설정되었는지 확인
    expect(result.current.title).toBe(mockEvent.title);

    // 폼 초기화
    act(() => {
      result.current.resetForm();
    });

    // 초기화 후 기본값으로 돌아갔는지 검증
    expect(result.current.title).toBe('');
    expect(result.current.date).toBe('');
    expect(result.current.startTime).toBe('');
    expect(result.current.endTime).toBe('');
    expect(result.current.description).toBe('');
    expect(result.current.location).toBe('');
    expect(result.current.category).toBe('');
    expect(result.current.isRepeating).toBe(false);
    expect(result.current.repeatType).toBe('none');
    expect(result.current.repeatInterval).toBe(1);
    expect(result.current.repeatEndDate).toBe('');
    expect(result.current.notificationTime).toBe(10);
  });

  it('editEvent가 이벤트 데이터로 폼을 설정하고 편집 상태를 활성화해야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    // 폼이 비어있는지 확인
    expect(result.current.title).toBe('');
    expect(result.current.editingEvent).toBeNull();

    // 편집 이벤트 호출
    act(() => {
      result.current.editEvent(mockEvent);
    });

    // 폼이 mockEvent 데이터로 채워졌는지 검증
    expect(result.current.title).toBe(mockEvent.title);
    expect(result.current.date).toBe(mockEvent.date);
    expect(result.current.startTime).toBe(mockEvent.startTime);
    expect(result.current.endTime).toBe(mockEvent.endTime);
    expect(result.current.description).toBe(mockEvent.description);
    expect(result.current.location).toBe(mockEvent.location);
    expect(result.current.category).toBe(mockEvent.category);

    // 편집 상태가 활성화되었는지 검증
    expect(result.current.editingEvent).toBe(mockEvent);
  });

  it('반복 일정이 있는 이벤트를 편집할 때 isRepeating이 true로 설정되어야 한다', () => {
    const repeatingEvent: Event = {
      ...mockEvent,
      repeat: { type: 'daily' as RepeatType, interval: 2, endDate: '2023-06-15' },
    };

    const { result } = renderHook(() => useEventForm());

    // 반복 이벤트로 편집 시작
    act(() => {
      result.current.editEvent(repeatingEvent);
    });

    // 반복 관련 필드가 올바르게 설정되었는지 검증
    expect(result.current.isRepeating).toBe(true);
    expect(result.current.repeatType).toBe('daily');
    expect(result.current.repeatInterval).toBe(2);
    expect(result.current.repeatEndDate).toBe('2023-06-15');
  });
});
