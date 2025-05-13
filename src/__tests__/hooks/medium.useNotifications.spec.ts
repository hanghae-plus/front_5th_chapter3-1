import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// 내부 모듈들
import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event, RepeatType } from '../../types.ts';
import { getUpcomingEvents, createNotificationMessage } from '../../utils/notificationUtils.ts';

// 모킹을 위한 변수 선언
let savedCallback: () => void;

// 모킹 설정
vi.mock('@chakra-ui/react', () => ({
  useInterval: (callback: () => void, delay: number) => {
    // callback을 즉시 실행하지 않고 저장만 함
    savedCallback = callback;
    return { isRunning: delay !== null };
  },
}));

vi.mock('../../utils/notificationUtils.ts', () => ({
  getUpcomingEvents: vi.fn(),
  createNotificationMessage: vi.fn(),
}));

describe('useNotifications 훅 테스트', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // 각 테스트 전에 저장된 콜백 초기화
    savedCallback = () => {};
  });

  it('초기 상태에서는 알림이 없어야 한다', async () => {
    // Arrange
    const mockEvents: Event[] = [];

    // 첫 번째 인터벌에서는 알림이 없도록 설정
    vi.mocked(getUpcomingEvents).mockReturnValue([]);

    // Act
    const { result } = renderHook(() => useNotifications(mockEvents));

    // 인터벌 콜백 수동 실행
    act(() => {
      savedCallback();
    });

    // Assert
    expect(result.current.notifications).toEqual([]);
    expect(result.current.notifiedEvents).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
    // Arrange
    const mockEvent: Event = {
      id: '1',
      title: '회의',
      date: '2023-05-12',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 15,
    };
    const mockEvents = [mockEvent];

    // Mock 함수 설정
    vi.mocked(getUpcomingEvents).mockReturnValue([mockEvent]);
    vi.mocked(createNotificationMessage).mockReturnValue('15분 후 회의 일정이 시작됩니다.');

    // Act
    const { result } = renderHook(() => useNotifications(mockEvents));

    // 초기 상태 확인 - 알림이 아직 없어야 함
    expect(result.current.notifications).toEqual([]);

    // 인터벌 콜백 수동 실행
    act(() => {
      savedCallback();
    });

    // Assert
    expect(getUpcomingEvents).toHaveBeenCalledWith(mockEvents, expect.any(Date), []);
    expect(result.current.notifications).toEqual([
      {
        id: '1',
        message: '15분 후 회의 일정이 시작됩니다.',
      },
    ]);
    expect(result.current.notifiedEvents).toEqual(['1']);

    // 시간이 지난 경우 시뮬레이션 - 더 이상 알림 대상 이벤트 없음
    vi.mocked(getUpcomingEvents).mockReturnValue([]);

    // 다시 인터벌 콜백 수동 실행
    act(() => {
      savedCallback();
    });

    // 알림 상태 유지 확인
    expect(result.current.notifications.length).toBe(1);
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
    // Arrange
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '회의',
        date: '2023-05-12',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 15,
      },
      {
        id: '2',
        title: '미팅',
        date: '2023-05-12',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 30,
      },
    ];

    // Mock 함수 설정
    vi.mocked(getUpcomingEvents).mockReturnValue(mockEvents);
    vi.mocked(createNotificationMessage)
      .mockReturnValueOnce('15분 후 회의 일정이 시작됩니다.')
      .mockReturnValueOnce('30분 후 미팅 일정이 시작됩니다.');

    // Act
    const { result } = renderHook(() => useNotifications(mockEvents));

    // 초기 상태 확인 - 아직 알림이 없어야 함
    expect(result.current.notifications).toEqual([]);

    // 인터벌 콜백 수동 실행
    act(() => {
      savedCallback();
    });

    // 초기 알림 상태 확인
    expect(result.current.notifications.length).toBe(2);
    expect(result.current.notifications[0].id).toBe('1');
    expect(result.current.notifications[1].id).toBe('2');

    // 첫 번째 알림 제거
    act(() => {
      result.current.removeNotification(0);
    });

    // Assert - 첫 번째 알림이 제거되었는지 확인
    expect(result.current.notifications.length).toBe(1);
    expect(result.current.notifications[0].id).toBe('2');

    // 남은 알림 제거
    act(() => {
      result.current.removeNotification(0);
    });

    // 모든 알림이 제거되었는지 확인
    expect(result.current.notifications.length).toBe(0);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
    // Arrange
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '회의',
        date: '2023-05-12',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 15,
      },
      {
        id: '2',
        title: '미팅',
        date: '2023-05-12',
        startTime: '11:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 30,
      },
    ];

    // Act - 초기 렌더링
    const { result } = renderHook(() => useNotifications(mockEvents));

    // 초기 상태 확인 - 알림이 아직 없어야 함
    expect(result.current.notifications).toEqual([]);

    // 첫 번째 체크: 첫 번째 이벤트만 알림 조건에 맞음
    vi.mocked(getUpcomingEvents).mockReturnValue([mockEvents[0]]);
    vi.mocked(createNotificationMessage).mockReturnValue('15분 후 회의 일정이 시작됩니다.');

    // 인터벌 콜백 수동 실행
    act(() => {
      savedCallback();
    });

    // 첫 번째 알림 확인
    expect(result.current.notifications.length).toBe(1);
    expect(result.current.notifications[0].id).toBe('1');
    expect(result.current.notifiedEvents).toEqual(['1']);

    // 두 번째 체크: 두 번째 이벤트만 새로 알림 대상이 됨
    vi.mocked(getUpcomingEvents).mockReturnValue([mockEvents[1]]);
    vi.mocked(createNotificationMessage).mockReturnValue('30분 후 미팅 일정이 시작됩니다.');

    // 시간 경과 시뮬레이션 (두 번째 체크)
    act(() => {
      savedCallback();
    });

    // Assert - 두 번째 체크 결과
    expect(getUpcomingEvents).toHaveBeenLastCalledWith(
      mockEvents,
      expect.any(Date),
      ['1'] // 이미 알림이 발생한 이벤트 ID
    );

    // 두 번째 알림이 추가되었는지 확인
    expect(result.current.notifications.length).toBe(2);
    expect(result.current.notifications[0].id).toBe('1');
    expect(result.current.notifications[1].id).toBe('2');
    expect(result.current.notifiedEvents).toEqual(['1', '2']);

    // 세 번째 체크: 더 이상 새 알림이 없음
    vi.mocked(getUpcomingEvents).mockReturnValue([]);

    act(() => {
      savedCallback();
    });

    // 알림 상태가 변경되지 않았는지 확인
    expect(result.current.notifications.length).toBe(2);
    expect(result.current.notifiedEvents).toEqual(['1', '2']);
  });
});
