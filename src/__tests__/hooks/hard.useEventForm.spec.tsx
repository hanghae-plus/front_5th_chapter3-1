// __tests__/useEventForm.spec.tsx
import { renderHook, act } from '@testing-library/react';
import { ChangeEvent } from 'react';

import { useEventForm } from '../../hooks/useEventForm';
import { getTimeErrorMessage } from '../../utils/timeValidation';
import { mockTestData } from '../data/mockTestData';
describe('useEventForm hook 테스트', () => {
  it('초기 상태가 빈 폼(defaults)이어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

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
    expect(result.current.startTimeError).toBeNull();
    expect(result.current.endTimeError).toBeNull();
    expect(result.current.editingEvent).toBeNull();
  });

  it('인자로 Event를 넘기면 초기값으로 폼이 채워져야 한다', () => {
    const { result } = renderHook(() => useEventForm(mockTestData));

    expect(result.current.title).toBe(mockTestData.title);
    expect(result.current.date).toBe(mockTestData.date);
    expect(result.current.startTime).toBe(mockTestData.startTime);
    expect(result.current.endTime).toBe(mockTestData.endTime);
    expect(result.current.description).toBe(mockTestData.description);
    expect(result.current.location).toBe(mockTestData.location);
    expect(result.current.category).toBe(mockTestData.category);
    expect(result.current.isRepeating).toBe(false);
    expect(result.current.repeatType).toBe(mockTestData.repeat.type);
    expect(result.current.repeatInterval).toBe(mockTestData.repeat.interval);
    expect(result.current.repeatEndDate).toBe(mockTestData.repeat.endDate);
    expect(result.current.notificationTime).toBe(mockTestData.notificationTime);
  });

  it('handleStartTimeChange / handleEndTimeChange 가 값을 설정하고 에러 상태도 갱신해야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.handleEndTimeChange({
        target: { value: '10:00' },
      } as ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.endTime).toBe('10:00');
    // startTimeError = getTimeErrorMessage('', '10:00').startTimeError
    expect(result.current.startTimeError).toBe(getTimeErrorMessage('', '10:00').startTimeError);

    act(() => {
      result.current.handleStartTimeChange({
        target: { value: '09:00' },
      } as ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.startTime).toBe('09:00');
    // 둘 다 정상 시간(09:00 < 10:00) 이므로 에러 null
    expect(result.current.startTimeError).toBeNull();
    expect(result.current.endTimeError).toBeNull();
  });

  it('resetForm 호출 시 모든 필드를 기본값으로 리셋해야 한다', () => {
    const { result } = renderHook(() => useEventForm(mockTestData));

    expect(result.current.title).toBe(mockTestData.title);

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.title).toBe('');
    expect(result.current.date).toBe('');
    expect(result.current.startTime).toBe('');
    expect(result.current.endTime).toBe('');
    expect(result.current.description).toBe('');
    expect(result.current.location).toBe('');
    expect(result.current.category).toBe('');
    expect(result.current.isRepeating).toBe(false);
    expect(result.current.repeatType).toBe('none');
  });

  it('editEvent 호출 시 editingEvent와 폼 필드가 전달한 이벤트로 채워져야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.editEvent(mockTestData);
    });

    expect(result.current.editingEvent).toEqual(mockTestData);
    expect(result.current.title).toBe(mockTestData.title);
    expect(result.current.date).toBe(mockTestData.date);
    expect(result.current.startTime).toBe(mockTestData.startTime);
    expect(result.current.endTime).toBe(mockTestData.endTime);
    expect(result.current.repeatType).toBe(mockTestData.repeat.type);
    expect(result.current.repeatInterval).toBe(mockTestData.repeat.interval);
  });
});
