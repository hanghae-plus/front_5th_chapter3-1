import { act, renderHook } from '@testing-library/react';

import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { useNotifications } from '../../shared/hooks/useNotifications.ts';
import { Event } from '../../types.ts';

const INITIAL_EVENTS = events as Event[];

// 저장되어있는 초기 이벤트 데이터를 적절하게 불러온다
it('초기 상태에서는 알림이 없어야 한다', async () => {
  const mockEvents = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      notificationTime: 10,
    },
  ];

  const { result } = renderHook(() => useNotifications(mockEvents));
  expect(result.current.notifications).toEqual([]);
});

// 새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다
it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
  vi.useFakeTimers();
  const now = new Date('2025-10-15T08:49:00');
  vi.setSystemTime(now);

  const { result } = renderHook(() => useNotifications(INITIAL_EVENTS));

  expect(result.current.notifications).toEqual([]);

  // 1분 후
  await act(() => {
    vi.advanceTimersByTime(1000 * 60); // 1초 지나면 useInterval 동작
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toEqual(['1']);
});

it('알림 조건에 맞는 이벤트가 있으면 알림이 생성된다', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-15T08:51:00'));

  const mockEvents = [
    {
      id: '1',
      title: '알림 테스트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      notificationTime: 10,
      description: '',
      location: '',
      category: '',
      repeat: undefined,
    },
  ];

  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].message).toBe('10분 후 알림 테스트 일정이 시작됩니다.');
});

it("'index 기준으로 알림을 제거한다.", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-15T08:51:00'));

  const mockEvents = [
    {
      id: '1',
      title: '알림 테스트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      notificationTime: 10,
      description: '',
      location: '',
      category: '',
      repeat: undefined,
    },
  ];

  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => {
    vi.advanceTimersByTime(1000);
  });
  // ✅ 먼저 알림이 생겼는지 확인
  expect(result.current.notifications).toHaveLength(1);
  // ✅ 알림 제거
  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toEqual([]);
});

it('존재하는 알림을 removeNotification으로 삭제하면 정상적으로 제거된다.', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-15T08:51:00'));

  const mockEvents = [
    {
      id: '1',
      title: '삭제 테스트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      notificationTime: 10,
      description: '',
      location: '',
      category: '',
      repeat: undefined,
    },
  ];

  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => {
    vi.advanceTimersByTime(1000); // 알림 1개 생성
  });

  // ✅ 알림이 생성되었는지 먼저 확인
  expect(result.current.notifications).toHaveLength(1);

  // ✅ 알림 제거
  act(() => {
    result.current.removeNotification(0);
  });

  // ✅ 알림이 정상적으로 제거되었는지 확인
  expect(result.current.notifications).toEqual([]);
});

it('이미 알림을 보낸 이벤트는 중복 알림이 발생하지 않는다', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-15T08:51:00'));

  const mockEvents = [
    {
      id: '1',
      title: '중복 테스트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      notificationTime: 10,
      description: '',
      location: '',
      category: '',
      repeat: undefined,
    },
  ];

  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => {
    vi.advanceTimersByTime(1000); // 첫 알림 발생
  });

  expect(result.current.notifications).toHaveLength(1);

  act(() => {
    vi.advanceTimersByTime(5000); // 다시 5초 경과
  });

  // 두번째 알람은 생기지 않아야함
  expect(result.current.notifications).toHaveLength(1);
});

it('알림이 없는 이벤트는 아무것도 생성되지 않는다', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-15T08:59:00')); // 1분 전

  const eventsWithoutNotification: Event[] = [
    {
      id: 'no-alert',
      title: '노티 없음',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      notificationTime: 0, // ❌ 알림 없음
      description: '',
      location: '',
      category: '',
      repeat: undefined,
    },
  ];

  const { result } = renderHook(() => useNotifications(eventsWithoutNotification));

  act(() => {
    vi.advanceTimersByTime(2000);
  });

  expect(result.current.notifications).toHaveLength(0);
});

it('과거 시간에 시작된 이벤트는 알림이 생성되지 않는다', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-15T10:30:00')); // 이벤트 이미 끝남

  const pastEvent: Event[] = [
    {
      id: 'past',
      title: '지난 일정',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      notificationTime: 10,
      description: '',
      location: '',
      category: '',
      repeat: undefined,
    },
  ];

  const { result } = renderHook(() => useNotifications(pastEvent));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(0);
});

it('알림 조건을 만족하는 이벤트가 여러 개일 경우 모두 알림이 생성된다', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-15T08:50:00'));

  const multipleEvents: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      notificationTime: 10,
      description: '',
      location: '',
      category: '',
      repeat: undefined,
    },
    {
      id: '2',
      title: '점심',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      notificationTime: 10,
      description: '',
      location: '',
      category: '',
      repeat: undefined,
    },
  ];

  const { result } = renderHook(() => useNotifications(multipleEvents));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(2);
  expect(result.current.notifications.map((n) => n.id)).toEqual(['1', '2']);
});
