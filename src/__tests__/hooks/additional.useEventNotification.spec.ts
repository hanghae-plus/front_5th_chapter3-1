import { act, renderHook } from '@testing-library/react';

import { useEventNotification } from '../../hooks/useEventNotification';

it('초기 상태에서는 알림 설정 시간이 10분이다.', () => {
  const { result } = renderHook(() => useEventNotification());
  expect(result.current).toEqual(expect.objectContaining({ notificationTime: 10 }));
});

it('알림 시간을 설정 할 수 있다.', () => {
  const { result } = renderHook(() => useEventNotification());

  act(() => {
    result.current.setNotificationTime(100);
  });

  expect(result.current).toEqual(expect.objectContaining({ notificationTime: 100 }));
});

it('알림 시간을 리셋 할 수 있다.', () => {
  const { result } = renderHook(() => useEventNotification());

  act(() => {
    result.current.resetNotification();
  });

  expect(result.current).toEqual(expect.objectContaining({ notificationTime: 10 }));
});
