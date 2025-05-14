import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-15T08:49:00'));
});

afterAll(() => {
  vi.useRealTimers();
});

describe('useNotifications', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '새로운 회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '새로운 회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(events));

    expect(result.current.notifications).toEqual([]);
    expect(result.current.notifiedEvents).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(60 * 1000);
    });

    expect(result.current.notifications).toEqual([
      {
        id: '1',
        message: '10분 후 기존 회의 일정이 시작됩니다.',
      },
    ]);
    expect(result.current.notifiedEvents).toEqual(['1']);
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(60 * 1000);
    });

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toEqual([]);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(60 * 1000);
    });

    expect(result.current.notifications).toEqual([
      {
        id: '1',
        message: '10분 후 기존 회의 일정이 시작됩니다.',
      },
    ]);

    act(() => {
      vi.advanceTimersByTime(60 * 1000);
    });

    expect(result.current.notifications).toEqual([
      {
        id: '1',
        message: '10분 후 기존 회의 일정이 시작됩니다.',
      },
    ]);
  });
});
