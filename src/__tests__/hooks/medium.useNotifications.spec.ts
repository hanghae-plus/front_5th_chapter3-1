import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

const events: Event[] = [
  {
    id: '7a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p',
    title: '이벤트 2',
    date: '2025-07-02',
    startTime: '09:00',
    endTime: '18:00',
    description: '제주도 여행',
    location: '제주도',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
  {
    id: '9b8c7d6e-5f4g-3h2i-1j0k-9l8m7n6o5p4',
    title: 'Test Title',
    date: '2025-07-01',
    startTime: '14:00',
    endTime: '16:00',
    description: '상반기 성과 회고 및 하반기 계획',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6',
    title: '가족 모임',
    date: '2025-07-31',
    startTime: '12:00',
    endTime: '15:00',
    description: '가족 모임 및 점심 식사',
    location: '가족 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7',
    title: '신입사원 교육',
    date: '2025-07-10',
    startTime: '10:00',
    endTime: '17:00',
    description: '신입사원 온보딩 교육',
    location: '교육장',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
];

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-07-01 13:00'));
});

afterEach(() => {
  vi.useRealTimers();
});

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(events));
  expect(result.current.notifications.length).toBe(0);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const { result } = renderHook(() => useNotifications(events));

  // 13:00에는 알림이 없음
  expect(result.current.notifications.length).toBe(0);

  // 13:59로 시간이 흐름
  act(() => {
    vi.advanceTimersByTime(59 * 60 * 1000);
  });

  // event2 알림이 생성됨
  expect(result.current.notifications.length).toBe(1);
  expect(result.current.notifications[0].message).toBe('1분 후 Test Title 일정이 시작됩니다.');
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(59 * 60 * 1000);
  });

  expect(result.current.notifications.length).toBe(1);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications.length).toBe(0);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(59 * 60 * 1000);
  });

  expect(result.current.notifications.length).toBe(1);

  // 1분 후에도 새로 추가된 알람은 없음
  act(() => {
    vi.advanceTimersByTime(1 * 60 * 1000);
  });

  expect(result.current.notifications.length).toBe(1);
});
