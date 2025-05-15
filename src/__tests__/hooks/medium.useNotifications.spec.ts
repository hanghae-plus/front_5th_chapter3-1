import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

describe('useNotifications', () => {
  // 테스트 기준 날짜 (2025년 5월 20일)
  const testDate = new Date('2025-05-20');
  const formattedDate = formatDate(testDate);

  // 인터벌 체크 주기 (1초 = 1000ms)
  const CHECK_INTERVAL = 1000;

  // 테스트에 사용할 목 이벤트
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: formattedDate,
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10, // 10분 전 알림
    },
    {
      id: '2',
      title: '점심 약속',
      date: formattedDate,
      startTime: '12:30',
      endTime: '13:30',
      description: '동료와 점심 식사',
      location: '회사 근처 식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10, // 10분 전 알림
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers(); // 가상 타이머 사용
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.notifiedEvents).toHaveLength(0);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    // 1. 팀 회의 알림 시간 직전으로 설정 (09:50:30)
    const meetingAlertTime = new Date(`${formattedDate}T09:50:30`);
    vi.setSystemTime(meetingAlertTime);

    expect(parseHM(meetingAlertTime.getTime())).toBe('09:50');

    // 2. 훅 렌더링
    const { result } = renderHook(() => useNotifications(mockEvents));

    // 3. 초기 상태 확인
    expect(result.current.notifications).toHaveLength(0);

    // 4. 시간을 1초 진행하여 인터벌 트리거 (09:50:31)
    act(() => {
      vi.advanceTimersByTime(CHECK_INTERVAL);
    });

    // 5. 알림이 생성되었는지 확인
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].id).toBe('1');
    expect(result.current.notifications[0].message).toBe('10분 후 팀 회의 일정이 시작됩니다.');
    expect(result.current.notifiedEvents).toContain('1');

    // 6. 시간을 점심 약속 알림 시간 직전으로 변경 (12:20:30)
    const lunchAlertTime = new Date(`${formattedDate}T12:20:30`);
    vi.setSystemTime(lunchAlertTime);

    expect(parseHM(lunchAlertTime.getTime())).toBe('12:20');

    // 7. 시간을 1초 진행하여 인터벌 트리거 (12:20:31)
    act(() => {
      vi.advanceTimersByTime(CHECK_INTERVAL);
    });

    // 8. 새 알림이 추가되었는지 확인
    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.notifications[1].id).toBe('2');
    expect(result.current.notifications[1].message).toBe('10분 후 점심 약속 일정이 시작됩니다.');
    expect(result.current.notifiedEvents).toContain('2');
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    // 1. 알림 시간 설정
    const meetingAlertTime = new Date(`${formattedDate}T09:50:30`);
    vi.setSystemTime(meetingAlertTime);

    expect(parseHM(meetingAlertTime.getTime())).toBe('09:50');

    // 2. 훅 렌더링
    const { result } = renderHook(() => useNotifications(mockEvents));

    // 3. 시간 진행으로 알림 생성
    act(() => {
      vi.advanceTimersByTime(CHECK_INTERVAL);
    });

    // 4. 알림이 생성되었는지 확인
    expect(result.current.notifications).toHaveLength(1);

    // 5. 알림 삭제
    act(() => {
      result.current.removeNotification(0);
    });

    // 6. 알림이 삭제되었는지 확인
    expect(result.current.notifications).toHaveLength(0);

    // 7. 시간을 점심 약속 알림 시간으로 변경
    const lunchAlertTime = new Date(`${formattedDate}T12:20:30`);
    vi.setSystemTime(lunchAlertTime);

    expect(parseHM(lunchAlertTime.getTime())).toBe('12:20');

    // 8. 시간 진행으로 두 번째 알림 생성
    act(() => {
      vi.advanceTimersByTime(CHECK_INTERVAL);
    });

    // 9. 두 번째 알림 확인
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].id).toBe('2');

    // 10. 두 번째 알림 삭제
    act(() => {
      result.current.removeNotification(0);
    });

    // 11. 모든 알림이 삭제되었는지 확인
    expect(result.current.notifications).toHaveLength(0);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    // 1. 알림 시간 설정
    const meetingAlertTime = new Date(`${formattedDate}T09:50:30`);
    vi.setSystemTime(meetingAlertTime);

    expect(parseHM(meetingAlertTime.getTime())).toBe('09:50');

    // 2. 훅 렌더링
    const { result } = renderHook(() => useNotifications(mockEvents));

    // 3. 시간 진행으로 알림 생성
    act(() => {
      vi.advanceTimersByTime(CHECK_INTERVAL);
    });

    // 4. 알림이 생성되었는지 확인
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toContain('1');

    // 5. 시간을 조금 더 진행 (09:51:30)
    const laterTime = new Date(`${formattedDate}T09:51:30`);
    vi.setSystemTime(laterTime);

    expect(parseHM(laterTime.getTime())).toBe('09:51');

    // 6. 다시 시간 진행으로 인터벌 트리거
    act(() => {
      vi.advanceTimersByTime(CHECK_INTERVAL);
    });

    // 7. 중복 알림이 생성되지 않았는지 확인
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toHaveLength(1);

    // 8. 이벤트 시작 시간으로 변경
    const meetingTime = new Date(`${formattedDate}T10:00:00`);
    vi.setSystemTime(meetingTime);

    expect(parseHM(meetingTime.getTime())).toBe('10:00');

    // 9. 다시 시간 진행으로 인터벌 트리거
    act(() => {
      vi.advanceTimersByTime(CHECK_INTERVAL);
    });

    // 10. 이벤트가 시작된 후에도 중복 알림이 생성되지 않았는지 확인
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toHaveLength(1);
  });
});
