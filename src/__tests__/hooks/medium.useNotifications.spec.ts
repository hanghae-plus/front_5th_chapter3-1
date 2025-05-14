import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const events: Event[] = [];
    // useNotifications 훅 렌더링
    const { result } = renderHook(() => useNotifications(events));

    // 초기 상태의 notifications 배열이 비어있는지 확인
    expect(result.current.notifications).toHaveLength(0);
    // 또는
    expect(result.current.notifications).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    // 이벤트 시작 시간보다 11분 전으로 설정 (여유 있게)
    const notificationTime = new Date(2024, 0, 1, 9, 49, 0, 0);
    vi.setSystemTime(notificationTime);

    const events: Event[] = [
      {
        id: '1',
        title: '테스트 이벤트',
        description: '테스트 설명',
        date: '2024-01-01',
        startTime: '10:00',
        endTime: '11:00',
        location: '테스트 장소',
        category: '회의',
        notificationTime: 10,
        repeat: {
          type: 'none',
          interval: 0,
        },
      },
    ];

    // 훅 렌더링
    const { result } = renderHook(() => useNotifications(events));

    // 초기에는 알림이 없어야 함
    expect(result.current.notifications).toHaveLength(0);

    // 1분 후로 시간 진행 (정확히 알림 시간으로)
    act(() => {
      vi.advanceTimersByTime(60 * 1000); // 1분 진행
    });

    // 상태 업데이트를 위한 시간
    act(() => {
      vi.advanceTimersByTime(100); // 약간의 시간 추가
    });

    // 이제 알림이 생성되어야 함
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toEqual({
      id: '1',
      message: '10분 후 테스트 이벤트 일정이 시작됩니다.',
    });

    // 추가 시간이 지나도 알림이 중복되지 않는지 확인
    act(() => {
      vi.advanceTimersByTime(30 * 1000); // 30초 더 진행
    });

    expect(result.current.notifications).toHaveLength(1);
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    // 1. 이벤트 시작 시간보다 11분 전으로 설정
    const notificationTime = new Date(2024, 0, 1, 9, 49, 0, 0);
    vi.setSystemTime(notificationTime);

    const events: Event[] = [
      {
        id: '1',
        title: '첫 번째 이벤트',
        description: '테스트 설명 1',
        date: '2024-01-01',
        startTime: '10:00',
        endTime: '11:00',
        location: '테스트 장소',
        category: '회의',
        notificationTime: 10,
        repeat: { type: 'none', interval: 0 },
      },
      {
        id: '2',
        title: '두 번째 이벤트',
        description: '테스트 설명 2',
        date: '2024-01-01',
        startTime: '10:00',
        endTime: '11:00',
        location: '테스트 장소',
        category: '회의',
        notificationTime: 10,
        repeat: { type: 'none', interval: 0 },
      },
    ];

    // 2. 훅 렌더링
    const { result } = renderHook(() => useNotifications(events));

    // 초기에는 알림이 없어야 함
    expect(result.current.notifications).toHaveLength(0);

    // 3. 시간을 1분 진행하여 알림 시간(9:50)이 되도록 함
    act(() => {
      vi.advanceTimersByTime(60 * 1000); // 1분 진행
    });

    // 상태 업데이트를 위한 추가 시간
    act(() => {
      vi.advanceTimersByTime(100); // 약간의 시간 추가
    });

    // 4. 이제 알림이 2개 생성되었는지 확인
    expect(result.current.notifications).toHaveLength(2);

    // 5. 첫 번째 알림(인덱스 0) 제거
    act(() => {
      result.current.removeNotification(0);
    });

    // 6. 알림이 정상적으로 제거되었는지 확인
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toEqual({
      id: '2',
      message: '10분 후 두 번째 이벤트 일정이 시작됩니다.',
    });
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    // 1. 이벤트 시작 시간보다 11분 전으로 설정
    const notificationTime = new Date(2024, 0, 1, 9, 49, 0, 0);
    vi.setSystemTime(notificationTime);

    const events: Event[] = [
      {
        id: '1',
        title: '테스트 이벤트',
        description: '테스트 설명',
        date: '2024-01-01',
        startTime: '10:00',
        endTime: '11:00',
        location: '테스트 장소',
        category: '회의',
        notificationTime: 10,
        repeat: { type: 'none', interval: 0 },
      },
    ];

    // 2. 훅 렌더링
    const { result } = renderHook(() => useNotifications(events));

    // 3. 초기에는 알림이 없어야 함
    expect(result.current.notifications).toHaveLength(0);

    // 4. 시간을 1분 진행하여 알림 시간(9:50)이 되도록 함
    act(() => {
      vi.advanceTimersByTime(60 * 1000); // 1분 진행
    });

    // 상태 업데이트를 위한 추가 시간
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // 5. 첫 번째 알림 생성 확인
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toEqual({
      id: '1',
      message: '10분 후 테스트 이벤트 일정이 시작됩니다.',
    });

    // 6. 시간을 추가로 여러 번 진행해도 알림이 중복 생성되지 않아야 함
    act(() => {
      // 1분 더 진행
      vi.advanceTimersByTime(60 * 1000);
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      // 5분 더 진행
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    expect(result.current.notifications).toHaveLength(1);

    // 7. 마지막으로 알림 내용이 변경되지 않았는지 확인
    expect(result.current.notifications[0]).toEqual({
      id: '1',
      message: '10분 후 테스트 이벤트 일정이 시작됩니다.',
    });
  });
});
