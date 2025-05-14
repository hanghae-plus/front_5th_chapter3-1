import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

const events: Event[] = [
  {
    id: '1',
    title: '이벤트1',
    date: '2025-10-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '이벤트1 설명',
    location: '이벤트1 장소',
    category: '이벤트1 카테고리',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '2',
    title: '이벤트2',
    date: '2025-10-01',
    startTime: '11:00',
    endTime: '12:00',
    description: '이벤트2 설명',
    location: '이벤트2 장소',
    category: '이벤트2 카테고리',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
];
const 초 = 1000;
const 분 = 60 * 초;

beforeEach(() => {
  vi.setSystemTime(new Date('2025-10-01 09:00'));
});

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(events));
  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const { result } = renderHook(() => useNotifications(events));
  expect(result.current.notifications).toEqual([]);
  act(() => {
    vi.advanceTimersByTime(59 * 분);
  });
  // 10월 1일 09:59에 이벤트1 알림이 생성되어 추가된다
  expect(result.current.notifications).toEqual([
    {
      id: '1',
      message: '1분 후 이벤트1 일정이 시작됩니다.',
    },
  ]);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications(events));
  act(() => {
    vi.advanceTimersByTime(59 * 분);
  });
  expect(result.current.notifications.length).toBeTruthy();

  const totalBeforeRemove = result.current.notifications.length;
  act(() => {
    result.current.removeNotification(totalBeforeRemove - 1);
  });
  expect(result.current.notifications.length).toBe(totalBeforeRemove - 1);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const { result } = renderHook(() => useNotifications(events));
  act(() => {
    vi.advanceTimersByTime(59 * 분);
  });
  expect(result.current.notifications).toEqual([
    {
      id: '1',
      message: '1분 후 이벤트1 일정이 시작됩니다.',
    },
  ]);
  act(() => {
    vi.advanceTimersByTime(1 * 분);
  });
  expect(result.current.notifications).toEqual([
    {
      id: '1',
      message: '1분 후 이벤트1 일정이 시작됩니다.',
    },
  ]);
});
