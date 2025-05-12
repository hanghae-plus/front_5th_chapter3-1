import { useInterval } from '@chakra-ui/react';
import { act, renderHook } from '@testing-library/react';

// 내부 모듈들
import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { getUpcomingEvents, createNotificationMessage } from '../../utils/notificationUtils.ts';

// 모킹 설정
vi.mock('@chakra-ui/react', () => ({
  useInterval: (callback: () => void, delay: number) => {
    callback(); // 초기 한 번 실행
    return { callback, delay };
  },
}));

vi.mock('../../utils/notificationUtils.ts', () => ({
  getUpcomingEvents: vi.fn(),
  createNotificationMessage: vi.fn(),
}));

describe('useNotifications', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    // Arrange
    const mockEvents: Event[] = [];

    // Act
    const { result } = renderHook(() => useNotifications(mockEvents));

    // Assert
    expect(result.current.notifications).toEqual([]);
    expect(result.current.notifiedEvents).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
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
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    };
    const mockEvents = [mockEvent];

    // Mock 함수 설정
    vi.mocked(getUpcomingEvents).mockReturnValue([mockEvent]);
    vi.mocked(createNotificationMessage).mockReturnValue('15분 후 회의 일정이 시작됩니다.');

    // Act
    const { result } = renderHook(() => useNotifications(mockEvents));

    // Assert
    // useInterval 모킹에서 callback을 초기에 한 번 실행하도록 설정했으므로 바로 확인 가능
    expect(getUpcomingEvents).toHaveBeenCalledWith(mockEvents, expect.any(Date), []);
    expect(result.current.notifications).toEqual([
      {
        id: '1',
        message: '15분 후 회의 일정이 시작됩니다.',
      },
    ]);
    expect(result.current.notifiedEvents).toEqual(['1']);

    // 시간이 지난 경우 시뮬레이션 - useInterval의 callback을 다시 호출
    vi.mocked(getUpcomingEvents).mockReturnValue([]);

    // callback 직접 호출 - useInterval이 1초마다 호출하는 방식을 시뮬레이션
    act(() => {
      // useInterval에 전달된 callback을 직접 호출
      const intervalCallback = vi.mocked(useInterval).mock.calls[0][0];
      intervalCallback();
    });

    // 알림 상태 유지 확인
    expect(result.current.notifications.length).toBe(1);
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
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
        repeat: { type: 'none', interval: 0 },
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
        repeat: { type: 'none', interval: 0 },
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

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
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
        repeat: { type: 'none', interval: 0 },
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
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
    ];

    // 첫 번째 체크: 첫 번째 이벤트만 알림 조건에 맞음
    vi.mocked(getUpcomingEvents).mockReturnValueOnce([mockEvents[0]]);
    vi.mocked(createNotificationMessage).mockReturnValueOnce('15분 후 회의 일정이 시작됩니다.');

    // Act - 초기 렌더링
    const { result } = renderHook(() => useNotifications(mockEvents));

    // 첫 번째 알림 확인
    expect(result.current.notifications.length).toBe(1);
    expect(result.current.notifications[0].id).toBe('1');
    expect(result.current.notifiedEvents).toEqual(['1']);

    // 두 번째 체크: 두 번째 이벤트만 새로 알림 대상이 됨
    vi.mocked(getUpcomingEvents).mockReturnValueOnce([mockEvents[1]]);
    vi.mocked(createNotificationMessage).mockReturnValueOnce('30분 후 미팅 일정이 시작됩니다.');

    // 시간 경과 시뮬레이션 (두 번째 체크) - useInterval의 callback을 다시 호출
    act(() => {
      const intervalCallback = vi.mocked(useInterval).mock.calls[0][0];
      intervalCallback();
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
    vi.mocked(getUpcomingEvents).mockReturnValueOnce([]);

    act(() => {
      const intervalCallback = vi.mocked(useInterval).mock.calls[0][0];
      intervalCallback();
    });

    // 알림 상태가 변경되지 않았는지 확인
    expect(result.current.notifications.length).toBe(2);
    expect(result.current.notifiedEvents).toEqual(['1', '2']);
  });
});
