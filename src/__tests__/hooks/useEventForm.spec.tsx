import { renderHook, act } from '@testing-library/react';

import { useEventForm } from '../../hooks/useEventForm';
import { Event } from '../../types';

describe('useEventForm', () => {
  const mockEvent: Event = {
    id: '1',
    title: 'Test Event',
    date: '2024-03-20',
    startTime: '10:00',
    endTime: '11:00',
    description: 'Test Description',
    location: 'Test Location',
    category: 'Test Category',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 10,
  };

  it('초기 이벤트가 제공되었을 때 해당 값으로 초기화되어야 한다', () => {
    const { result } = renderHook(() => useEventForm(mockEvent));

    expect(result.current.watch('title')).toBe(mockEvent.title);
    expect(result.current.watch('date')).toBe(mockEvent.date);
    expect(result.current.watch('startTime')).toBe(mockEvent.startTime);
    expect(result.current.watch('endTime')).toBe(mockEvent.endTime);
    expect(result.current.watch('description')).toBe(mockEvent.description);
    expect(result.current.watch('location')).toBe(mockEvent.location);
    expect(result.current.watch('category')).toBe(mockEvent.category);
    expect(result.current.watch('isRepeating')).toBe(false);
    expect(result.current.watch('repeatType')).toBe('none');
    expect(result.current.watch('repeatInterval')).toBe(1);
    expect(result.current.watch('notificationTime')).toBe(mockEvent.notificationTime);
  });

  it('setValue가 호출되었을 때 폼 값이 업데이트되어야 한다', () => {
    const { result } = renderHook(() => useEventForm(null));

    act(() => {
      result.current.setValue('title', 'New Title');
      result.current.setValue('date', '2024-03-21');
      result.current.setValue('startTime', '14:00');
      result.current.setValue('endTime', '15:00');
    });

    expect(result.current.watch('title')).toBe('New Title');
    expect(result.current.watch('date')).toBe('2024-03-21');
    expect(result.current.watch('startTime')).toBe('14:00');
    expect(result.current.watch('endTime')).toBe('15:00');
  });

  it('resetForm이 호출되었을 때 폼이 기본값으로 초기화되어야 한다', () => {
    const { result } = renderHook(() => useEventForm(mockEvent));

    act(() => {
      result.current.setValue('title', 'New Title');
      result.current.setValue('date', '2024-03-21');
      result.current.resetForm();
    });

    expect(result.current.watch('title')).toBe('');
    expect(result.current.watch('date')).toBe('');
    expect(result.current.watch('startTime')).toBe('');
    expect(result.current.watch('endTime')).toBe('');
    expect(result.current.watch('description')).toBe('');
    expect(result.current.watch('location')).toBe('');
    expect(result.current.watch('category')).toBe('');
    expect(result.current.watch('isRepeating')).toBe(false);
    expect(result.current.watch('repeatType')).toBe('none');
    expect(result.current.watch('repeatInterval')).toBe(1);
    expect(result.current.watch('repeatEndDate')).toBe('');
    expect(result.current.watch('notificationTime')).toBe(10);
  });

  it('종료 시간이 시작 시간보다 이전일 때 시간 유효성 검사 오류가 발생해야 한다', () => {
    const { result } = renderHook(() => useEventForm(null));

    act(() => {
      result.current.setValue('startTime', '14:00');
      result.current.setValue('endTime', '13:00');
    });

    expect(result.current.startTimeError).toBeDefined();
    expect(result.current.endTimeError).toBeDefined();
  });

  it('반복 일정 설정이 올바르게 동작해야 한다', () => {
    const { result } = renderHook(() => useEventForm(null));

    act(() => {
      result.current.setValue('isRepeating', true);
      result.current.setValue('repeatType', 'daily');
      result.current.setValue('repeatInterval', 2);
      result.current.setValue('repeatEndDate', '2024-03-25');
    });

    expect(result.current.watch('isRepeating')).toBe(true);
    expect(result.current.watch('repeatType')).toBe('daily');
    expect(result.current.watch('repeatInterval')).toBe(2);
    expect(result.current.watch('repeatEndDate')).toBe('2024-03-25');
  });
});
