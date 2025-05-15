import { act, renderHook } from '@testing-library/react';

import { useEventRepeat } from '../../hooks/useEventRepeat';
import { RepeatInfo } from '../../types';

const mockEventRepeat: RepeatInfo = {
  type: 'daily',
  interval: 7,
  endDate: '2025-12-31',
};
const defaultNotification = {
  isRepeating: true,
  repeatEndDate: '',
  repeatInterval: 1,
  repeatType: 'none',
};

it('초기 상태에서는 반복 일정에 대한 설정이 기본값이다.', () => {
  const { result } = renderHook(() => useEventRepeat());
  expect(result.current).toEqual(expect.objectContaining(defaultNotification));
});

it('반복 일정 정보를 저장할 수 있다.', () => {
  const { result } = renderHook(() => useEventRepeat());

  act(() => result.current.setRepeatInfo(mockEventRepeat));

  expect(result.current).toEqual(
    expect.objectContaining({
      isRepeating: true,
      repeatEndDate: '2025-12-31',
      repeatInterval: 7,
      repeatType: 'daily',
    })
  );
});

it('반복 일정 정보를 리셋할 수 있다.', () => {
  const { result } = renderHook(() => useEventRepeat());

  act(() => result.current.resetRepeat());

  expect(result.current).toEqual(
    expect.objectContaining({ ...defaultNotification, isRepeating: false })
  );
});
