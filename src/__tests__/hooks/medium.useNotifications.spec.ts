import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event, RepeatType } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

function makeEvent(id: string, updatedProperty: Partial<Event> = {}): Event {
  const defaultEvent = {
    id: id,
    title: `이벤트 ${id}`,
    date: formatDate(new Date()),
    startTime: '10:00',
    endTime: '11:00',
    description: `이벤트 ${id} 설명`,
    location: `이벤트 ${id} 장소`,
    category: `이벤트 ${id} 카테고리`,
    repeat: {
      type: 'none' as RepeatType,
      interval: 0,
    },
    notificationTime: 10,
  };
  return { ...defaultEvent, ...updatedProperty };
}

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));
  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const pastEvent: Event = makeEvent('1', {
    date: '2025-01-01',
  });
  const { result } = renderHook(() => useNotifications([pastEvent]));

  vi.useFakeTimers();
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  console.log(result.current.notifications);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {});
