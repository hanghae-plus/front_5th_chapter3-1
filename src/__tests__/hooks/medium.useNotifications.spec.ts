import { act, renderHook } from '@testing-library/react';

import { events } from '../../__mocks__/response/events.json';
import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event, RepeatType } from '../../types.ts';

const SEC_IN_MS = 1000;
const ONE_MINUTE = SEC_IN_MS * 60;
const TEN_MINUTES = ONE_MINUTE * 10;

const initialEvents: Event[] = events.map((event) => ({
  ...event,
  repeat: {
    ...event.repeat,
    type: event.repeat.type as RepeatType, // 타입 변환: string -> RepeatType
  },
}));

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(initialEvents));
  expect(result.current.notifications).toHaveLength(0);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const testTime = new Date('2025-10-15T08:50:00');
  vi.useFakeTimers();
  vi.setSystemTime(testTime);

  const { result } = renderHook(() => useNotifications(initialEvents));
  act(() => {
    vi.advanceTimersByTime(SEC_IN_MS);
  });

  expect(result.current.notifications).toEqual([
    { id: '1', message: '10분 후 기존 회의 일정이 시작됩니다.' },
  ]);

  vi.useRealTimers();
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications(initialEvents));
  act(() => {
    result.current.removeNotification(0);
  });
  expect(result.current.notifications).toHaveLength(0);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
  const testTime = new Date('2025-10-15T08:49:00');
  vi.useFakeTimers();
  vi.setSystemTime(testTime);
  const { result } = renderHook(() => useNotifications(initialEvents));
  expect(result.current.notifications).toHaveLength(0);

  act(() => {
    vi.advanceTimersByTime(ONE_MINUTE);
  });
  expect(result.current.notifications).toHaveLength(1);

  act(() => {
    vi.advanceTimersByTime(TEN_MINUTES);
  });
  expect(result.current.notifications).toHaveLength(1);

  vi.useRealTimers();
});
