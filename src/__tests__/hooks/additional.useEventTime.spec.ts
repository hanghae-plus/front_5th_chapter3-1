import { act, renderHook } from '@testing-library/react';
import { ChangeEvent } from 'react';

import { useEventTime } from '../../hooks/useEventTime';

const createChangeEvent = (value: string): ChangeEvent<HTMLInputElement> =>
  ({
    target: { value },
  }) as ChangeEvent<HTMLInputElement>;

it('초기 상태에서는 시작 시간과 종료 시간이 설정되어 있지 않다.', () => {
  const { result } = renderHook(() => useEventTime());
  expect(result.current).toEqual(
    expect.objectContaining({
      endTime: '',
      endTimeError: null,
      startTime: '',
      startTimeError: null,
    })
  );
});

it('시작 시간과 종료 시간을 설정할 수 있다.', () => {
  const { result } = renderHook(() => useEventTime());

  act(() => {
    result.current.setEventTime('2025-05-20', '2025-05-22');
  });
  expect(result.current).toEqual(
    expect.objectContaining({
      endTime: '2025-05-22',
      endTimeError: null,
      startTime: '2025-05-20',
      startTimeError: null,
    })
  );
});

it('시작 시간과 종료 시간을 리셋할 수 있다.', () => {
  const { result } = renderHook(() => useEventTime());

  act(() => {
    result.current.resetTime();
  });
  expect(result.current).toEqual(
    expect.objectContaining({
      endTime: '',
      endTimeError: null,
      startTime: '',
      startTimeError: null,
    })
  );
});

it('시작 시간이 종료 시간보다 늦을 경우 에러 메시지를 받는다.', async () => {
  const { result } = renderHook(() => useEventTime('10:00', '11:00'));

  act(() => {
    const event = createChangeEvent('12:00');
    result.current.handleStartTimeChange(event);
  });

  await act(() => null);

  expect(result.current).toEqual(
    expect.objectContaining({
      endTime: '11:00',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
      startTime: '12:00',
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    })
  );
});

it('종료 시간이 시작 시간보다 빠를 경우 에러 메시지를 받는다.', async () => {
  const { result } = renderHook(() => useEventTime('10:00', '11:00'));

  act(() => {
    const event = createChangeEvent('09:00');
    result.current.handleEndTimeChange(event);
  });

  await act(() => null);

  expect(result.current).toEqual(
    expect.objectContaining({
      endTime: '09:00',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
      startTime: '10:00',
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    })
  );
});
