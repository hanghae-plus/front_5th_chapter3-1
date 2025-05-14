import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

let intervalCallback: () => void;
vi.mock('@chakra-ui/react', () => ({
  useInterval: (callback: () => void) => {
    intervalCallback = callback;
  },
}));

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));

  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const now = Date.now();
  const startTime = now + 600000;
  const mockEvent: Event = {
    id: '1',
    title: '회의',
    date: formatDate(new Date()),
    startTime: parseHM(startTime),
    endTime: parseHM(startTime + 3600000),
    description: '팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  const { result } = renderHook(() => useNotifications([mockEvent]));

  expect(result.current.notifications).toEqual([]);

  act(() => {
    intervalCallback();
  });

  expect(result.current.notifications.length).toBe(1);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications([]));

  act(() => {
    result.current.setNotifications([
      { id: '1', message: '알림 1' },
      { id: '2', message: '알림 2' },
      { id: '3', message: '알림 3' },
    ]);
  });

  act(() => {
    result.current.removeNotification(1);
  });

  expect(result.current.notifications).toEqual([
    { id: '1', message: '알림 1' },
    { id: '3', message: '알림 3' },
  ]);
  expect(result.current.notifications.length).toBe(2);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const now = Date.now();
  const startTime = now + 600000;
  const mockEvent: Event = {
    id: '1',
    title: '회의 시작',
    date: formatDate(new Date()),
    startTime: parseHM(startTime),
    endTime: parseHM(startTime + 3600000),
    description: '회의가 시작됩니다',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  const { result } = renderHook(() => useNotifications([mockEvent]));

  act(() => {
    intervalCallback();
  });

  expect(result.current.notifications.length).toBe(1);

  // 다시 호출해도 알림이 중복해서 추가되면 안 됨
  act(() => {
    intervalCallback();
  });

  expect(result.current.notifications.length).toBe(1);
});
