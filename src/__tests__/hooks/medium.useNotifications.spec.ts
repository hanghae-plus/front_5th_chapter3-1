import {act, renderHook} from '@testing-library/react';

import {useNotifications} from '../../hooks/useNotifications.ts';
import {events} from '../../__mocks__/response/events.json' assert {type: 'json'};
import {Event} from '../../types.ts';
import {formatDate} from '../../utils/dateUtils.ts';
import {parseHM} from '../utils.ts';

it('초기 상태에서는 알림이 없어야 한다', () => {
  const {result} = renderHook(() => useNotifications(events as Event[]))
  expect(result.current.notifications).toHaveLength(0)
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  vi.useFakeTimers();

  const {result} = renderHook(() => useNotifications(events as Event[]))
  vi.setSystemTime(new Date('2025-10-15T08:50'))
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(result.current.notifications).toHaveLength(1)
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  vi.useFakeTimers();

  const {result} = renderHook(() => useNotifications(events as Event[]))
  vi.setSystemTime(new Date('2025-10-15T08:50'))
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1)
  act(() => {
    result.current.removeNotification(0)
  });
  expect(result.current.notifications).toHaveLength(0)
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  vi.useFakeTimers();

  const {result} = renderHook(() => useNotifications(events as Event[]))
  vi.setSystemTime(new Date('2025-10-15T08:50'))
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1)
  act(() => {
    result.current.removeNotification(0)
  });
  expect(result.current.notifications).toHaveLength(0)

  vi.setSystemTime(new Date('2025-10-15T08:51'))
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(result.current.notifications).toHaveLength(0)
});
