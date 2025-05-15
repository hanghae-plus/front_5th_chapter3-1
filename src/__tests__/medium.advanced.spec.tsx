import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../hooks/useCalendarView';
import { useEventForm } from '../hooks/useEventForm';

it('startTimeError 값을 바꾼다', () => {
  const { result } = renderHook(() => useEventForm());

  expect(result.current.startTimeError).toBeNull();

  act(() => {
    result.current.setTimeError({
      startTimeError: '시작하기 전입니다.',
      endTimeError: null,
    });
  });

  expect(result.current.startTimeError).toBe('시작하기 전입니다.');
});

it('endTimeError를 바꾼다', () => {
  const { result } = renderHook(() => useEventForm());

  expect(result.current.endTimeError).toBeNull();

  act(() => {
    result.current.setTimeError({
      startTimeError: null,
      endTimeError: '종료 전입니다.',
    });
  });

  expect(result.current.endTimeError).toBe('종료 전입니다.');
});

it('useCalendarView 의 초기값은 month 이어야 한다', () => {
  const { result } = renderHook(() => useCalendarView());
  expect(result.current.view).toBe('month');
});

it('오늘 날짜가 5월일 경우 navigate를 이용해서 6월로 갈 수 있어야 한다.', () => {
  vi.setSystemTime(new Date('2025-05-01'));

  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.navigate('next');
  });

  expect(result.current.currentDate).toEqual(new Date('2025-06-01'));
});

it('초기값 month 에서 week로 변경이 되어야 한다.', () => {
  const { result } = renderHook(() => useCalendarView());

  expect(result.current.view).toBe('month');

  act(() => {
    result.current.setView('week');
  });
  expect(result.current.view).toBe('week');
});
