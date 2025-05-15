import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-05-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-05-01',
    startTime: '12:00',
    endTime: '13:00',
    description: '팀 점심',
    location: '식당',
    category: '식사',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 5,
  },
];

describe('useNotifications', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-05-01 09:50:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.notifiedEvents).toHaveLength(0);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    // 1초 후 알림 체크
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].id).toBe('1');
    expect(result.current.notifications[0].message).toBe('10분 후 팀 회의 일정이 시작됩니다.');
    expect(result.current.notifiedEvents).toContain('1');

    // 5분 후 추가 알림 체크
    vi.setSystemTime(new Date('2025-05-01 11:55:00'));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.notifications[1].id).toBe('2');
    expect(result.current.notifications[1].message).toBe('5분 후 점심 약속 일정이 시작됩니다.');
    expect(result.current.notifiedEvents).toContain('2');
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    // 알림 생성
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(result.current.notifications).toHaveLength(1);

    // 첫 번째 알림 제거
    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    // 첫 번째 알림 생성
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toContain('1');

    // 동일한 시간에 다시 체크
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    // 알림이 중복 생성되지 않았는지 확인
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toHaveLength(1);
  });
});
