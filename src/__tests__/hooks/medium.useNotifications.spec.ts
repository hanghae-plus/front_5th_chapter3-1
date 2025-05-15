import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

const events: Event[] = [
  {
    category: '업무',
    date: '2025-05-20',
    id: '1',
    title: '팀 회의',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A"',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    category: '개인',
    date: '2025-05-30',
    id: '2',
    title: '팀 회의 하다가 인사하기',
    startTime: '12:30',
    endTime: '13:30',
    description: '지나가면서 신규에게 인사하기',
    location: '회사',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-05-20T09:50:00'));
});

afterEach(() => {
  vi.useRealTimers();
});

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(events));
  expect(result.current.notifications).toHaveLength(0);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toEqual([
    { id: '1', message: '10분 후 팀 회의 일정이 시작됩니다.' },
  ]);
});

it('index를 기준으로 알림을 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toEqual([
    { id: '1', message: '10분 후 팀 회의 일정이 시작됩니다.' },
  ]);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toEqual([]);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const { result } = renderHook(() => useNotifications(events));
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toEqual([
    { id: '1', message: '10분 후 팀 회의 일정이 시작됩니다.' },
  ]);

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toEqual([
    { id: '1', message: '10분 후 팀 회의 일정이 시작됩니다.' },
  ]);
});
