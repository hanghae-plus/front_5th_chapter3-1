import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event, RepeatType } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { createNotificationMessage } from '../../utils/notificationUtils.ts';

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
  const upComingEvent: Event = makeEvent('1', {
    date: formatDate(new Date()),
    startTime: '01:30',
    endTime: '02:10',
    notificationTime: 120,
  });
  const { result } = renderHook(() => useNotifications([upComingEvent]));

  vi.useFakeTimers();
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toEqual([
    {
      id: upComingEvent.id,
      message: createNotificationMessage(upComingEvent),
    },
  ]);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const upComingEvent: Event = makeEvent('1', {
    date: formatDate(new Date()),
    startTime: '01:30',
    endTime: '02:10',
    notificationTime: 120,
  });
  const { result } = renderHook(() => useNotifications([upComingEvent]));

  vi.useFakeTimers();
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toEqual([]);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const upComingEvent: Event = makeEvent('1', {
    date: formatDate(new Date()),
    startTime: '01:30',
    endTime: '02:10',
    notificationTime: 120,
  });
  const { result } = renderHook(() => useNotifications([upComingEvent]));

  vi.useFakeTimers();

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  //타이머가 두번 지나도 알림이 하나만 생성
  expect(result.current.notifications).toEqual([
    {
      id: upComingEvent.id,
      message: createNotificationMessage(upComingEvent),
    },
  ]);
});
