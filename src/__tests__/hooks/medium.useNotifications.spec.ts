import { act, renderHook } from '@testing-library/react';

import { formatDate } from '../../based/utils/dateUtils.ts';
import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { parseHM } from '../utils.ts';

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2024-03-21',
    startTime: '14:00',
    endTime: '15:00',
    description: '새로운 테스트 설명',
    notificationTime: 10,
    location: '새로운 장소',
    category: '미팅',
    repeat: { type: 'none', interval: 0 },
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2024-03-22',
    startTime: '15:00',
    endTime: '16:00',
    description: '새로운 테스트 설명',
    notificationTime: 10,
    location: '새로운 장소',
    category: '미팅',
    repeat: { type: 'none', interval: 0 },
  },
];

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(MOCK_EVENTS));

  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  vi.useFakeTimers();

  const now = new Date();
  const soon = new Date(now.getTime() + 1000 * 60);
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: formatDate(soon),
      startTime: parseHM(soon.getTime()),
      endTime: parseHM(soon.getTime() + 1000 * 60),
      notificationTime: 1,
      repeat: { type: 'none', interval: 0 },
      location: '새로운 장소',
      category: '미팅',
      description: '새로운 테스트 설명',
    },
  ];

  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications).toHaveLength(0);

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].id).toBe('1');
});

it('알람 생성 후 index를 기준으로 알림을 제거할 수 있다', () => {
  vi.useFakeTimers();

  const now = new Date();
  const soon = new Date(now.getTime() + 1000 * 60);
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: formatDate(soon),
      startTime: parseHM(soon.getTime()),
      endTime: parseHM(soon.getTime() + 1000 * 60),
      notificationTime: 1,
      repeat: { type: 'none', interval: 0 },
      location: '새로운 장소',
      category: '미팅',
      description: '새로운 테스트 설명',
    },
    {
      id: '2',
      title: '이벤트 2',
      date: formatDate(soon),
      startTime: parseHM(soon.getTime()),
      endTime: parseHM(soon.getTime() + 1000 * 60),
      notificationTime: 1,
      repeat: { type: 'none', interval: 0 },
      location: '새로운 장소',
      category: '미팅',
      description: '새로운 테스트 설명',
    },
  ];

  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications).toHaveLength(0);

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(1);

  vi.useRealTimers();
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  // 1. 알림이 발생할 시각으로 시스템 시간 고정
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-03-21T13:50:00'));

  const MOCK_EVENTS: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2024-03-21',
      startTime: '14:00',
      endTime: '15:00',
      description: '설명',
      notificationTime: 10, // 10분 전 알림
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
    },
  ];

  const { result } = renderHook(() => useNotifications(MOCK_EVENTS));

  // 2. 1초 흐르게 해서 알림이 한 번 생성되게 함
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  // 3. 알림이 1개 생성됐는지 확인
  expect(result.current.notifications).toHaveLength(1);

  // 4. 다시 5초 흐르게 (알림이 중복 생성되면 안 됨)
  act(() => {
    vi.advanceTimersByTime(5000);
  });

  // 5. 여전히 알림이 1개인지 확인 (중복 알림 없음)
  expect(result.current.notifications).toHaveLength(1);

  vi.useRealTimers();
});
