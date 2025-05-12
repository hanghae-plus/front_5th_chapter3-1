import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

const now = new Date();
const today = formatDate(now);
const nowHM = parseHM(now.getTime());

const sampleEvents: Event[] = [
  {
    id: '1',
    title: '회의',
    description: '팀 회의',
    location: '회의실 A',
    category: '업무',
    date: today,
    startTime: nowHM,
    endTime: '11:00',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  },
];

beforeEach(() => {
  vi.useRealTimers(); // 🧹 반드시 타이머 초기화
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
  vi.setSystemTime(now); // 기준 시간 설정
});

afterEach(() => {
  vi.useRealTimers();
});

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));
  expect(result.current.notifications).toHaveLength(0);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
  const { result } = renderHook(() => useNotifications(sampleEvents));

  act(() => {
    vi.advanceTimersByTime(1000); // 1초 경과
  });

  await Promise.resolve(); // 상태 업데이트 기다리기

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].message).toContain('회의');
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications(sampleEvents));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(0);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const { result } = renderHook(() => useNotifications(sampleEvents));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);

  act(() => {
    vi.advanceTimersByTime(5000); // 더 시간 경과해도
  });

  expect(result.current.notifications).toHaveLength(1); // 여전히 1개여야 함
});
