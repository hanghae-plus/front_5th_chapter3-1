import { act, renderHook } from '@testing-library/react';

import { useEventForm } from '../../hooks/useEventForm.ts';
import { Event } from '../../types.ts';

it('초기값이 올바르게 설정되어야 한다', () => {
  const { result } = renderHook(() => useEventForm());

  expect(result.current.values.title).toBe('');
  expect(result.current.values.isRepeating).toBe(true);
  expect(result.current.errors.startTimeError).toBeNull();
  expect(result.current.errors.endTimeError).toBeNull();
});

it('setTitle을 호출하면 title 상태가 변경되어야 한다', () => {
  const { result } = renderHook(() => useEventForm());

  act(() => {
    result.current.setters.setTitle('테스트 일정');
  });

  expect(result.current.values.title).toBe('테스트 일정');
});

it('editEvent를 호출하면 해당 이벤트 정보로 값이 설정되어야 한다', () => {
  const dummyEvent: Event = {
    id: '1',
    title: '회의',
    date: '2025-10-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '상세 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-12-31',
    },
    notificationTime: 5,
  };

  const { result } = renderHook(() => useEventForm());

  act(() => {
    result.current.editEvent(dummyEvent);
  });

  expect(result.current.values.title).toBe('회의');
  expect(result.current.values.repeatType).toBe('weekly');
  expect(result.current.values.notificationTime).toBe(5);
});

it('resetForm을 호출하면 초기 상태로 리셋되어야 한다', () => {
  const { result } = renderHook(() => useEventForm());

  act(() => {
    result.current.setters.setTitle('일정');
    result.current.resetForm();
  });

  expect(result.current.values.title).toBe('');
  expect(result.current.values.date).toBe('');
});
