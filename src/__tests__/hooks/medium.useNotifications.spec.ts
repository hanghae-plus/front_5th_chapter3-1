import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

// useInterval 목킹
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useInterval: (callback: () => void) => {
      // 테스트에서 수동으로 interval 콜백을 호출할 수 있도록 함
      (global as any).intervalCallback = callback;
    },
  };
});

describe('useNotifications', () => {
  // 테스트 기준 날짜 (2025년 5월 20일)
  const testDate = new Date('2025-05-20');
  const formattedDate = formatDate(testDate);

  // 테스트에 사용할 목 이벤트
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: formattedDate, // formatDate 사용
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
      date: formattedDate, // formatDate 사용
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
    vi.useFakeTimers();
    vi.resetAllMocks();
    (global as any).intervalCallback = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    delete (global as any).intervalCallback;
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    // useNotifications 훅 렌더링
    const { result } = renderHook(() => useNotifications(mockEvents));

    // 초기 상태 확인
    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.notifiedEvents).toHaveLength(0);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    // 테스트 시간 설정: 팀 회의 알림 시간 직후 (9시 51분)
    const meetingTime = new Date(`${formattedDate}T10:00:00`);
    const notificationTime = new Date(
      meetingTime.getTime() - mockEvents[0].notificationTime * 60 * 1000 + 60000
    ); // 알림 시간 1분 후
    vi.setSystemTime(notificationTime);

    // 시간 문자열로 변환 (parseHM 사용)
    // const currentTimeString = parseHM(notificationTime.getTime());
    // console.log(`현재 시간: ${currentTimeString}`); // 9:51

    // useNotifications 훅 렌더링
    const { result } = renderHook(() => useNotifications(mockEvents));

    // 초기 상태 확인
    expect(result.current.notifications).toHaveLength(0);

    // interval 콜백 수동 실행
    act(() => {
      (global as any).intervalCallback();
    });

    // 팀 회의에 대한 알림이 생성되었는지 확인
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].id).toBe('1');
    expect(result.current.notifications[0].message).toBe('10분 후 팀 회의 일정이 시작됩니다.');
    expect(result.current.notifiedEvents).toContain('1');

    // 시간을 점심 약속 알림 시간 직후로 변경 (12시 21분)
    const lunchTime = new Date(`${formattedDate}T12:30:00`);
    const lunchNotificationTime = new Date(
      lunchTime.getTime() - mockEvents[1].notificationTime * 60 * 1000 + 60000
    ); // 알림 시간 1분 후
    vi.setSystemTime(lunchNotificationTime);

    // 시간 문자열로 변환 (parseHM 사용)
    // const lunchTimeString = parseHM(lunchNotificationTime.getTime());
    // console.log(`점심 시간: ${lunchTimeString}`); // 12:21

    // interval 콜백 다시 실행
    act(() => {
      (global as any).intervalCallback();
    });

    // 점심 약속에 대한 알림이 추가되었는지 확인
    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.notifications[1].id).toBe('2');
    expect(result.current.notifications[1].message).toBe('10분 후 점심 약속 일정이 시작됩니다.');
    expect(result.current.notifiedEvents).toContain('2');
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    // 테스트 시간 설정: 팀 회의 알림 시간 직후
    const meetingTime = new Date(`${formattedDate}T10:00:00`);
    const notificationTime = new Date(
      meetingTime.getTime() - mockEvents[0].notificationTime * 60 * 1000 + 60000
    );
    vi.setSystemTime(notificationTime);

    // useNotifications 훅 렌더링
    const { result } = renderHook(() => useNotifications(mockEvents));

    // interval 콜백 실행하여 알림 생성
    act(() => {
      (global as any).intervalCallback();
    });

    // 알림이 생성되었는지 확인
    expect(result.current.notifications).toHaveLength(1);

    // 알림 삭제 함수 호출
    act(() => {
      result.current.removeNotification(0);
    });

    // 알림이 삭제되었는지 확인
    expect(result.current.notifications).toHaveLength(0);

    // 두 번째 이벤트의 알림 시간으로 변경
    const lunchTime = new Date(`${formattedDate}T12:30:00`);
    const lunchNotificationTime = new Date(
      lunchTime.getTime() - mockEvents[1].notificationTime * 60 * 1000 + 60000
    );
    vi.setSystemTime(lunchNotificationTime);

    // interval 콜백 다시 실행
    act(() => {
      (global as any).intervalCallback();
    });

    // 두 번째 알림이 생성되었는지 확인
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].id).toBe('2');

    // 다시 알림 삭제
    act(() => {
      result.current.removeNotification(0);
    });

    // 모든 알림이 삭제되었는지 확인
    expect(result.current.notifications).toHaveLength(0);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const meetingTime = new Date(`${formattedDate}T10:00:00`);
    const notificationTime = new Date(
      meetingTime.getTime() - mockEvents[0].notificationTime * 60 * 1000 + 60000
    );
    vi.setSystemTime(notificationTime);

    // 시간 문자열로 변환 (parseHM 사용)
    // const timeString = parseHM(notificationTime.getTime());
    // console.log(`알림 시간: ${timeString}`);

    // useNotifications 훅 렌더링
    const { result } = renderHook(() => useNotifications(mockEvents));

    // interval 콜백 첫 번째 실행
    act(() => {
      (global as any).intervalCallback();
    });

    // 알림이 생성되었는지 확인
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toContain('1');

    // 시간이 조금 더 지났지만 여전히 알림 시간 내인 경우 (9:52)
    const laterTime = new Date(notificationTime.getTime() + 60000); // 1분 후
    vi.setSystemTime(laterTime);

    // 시간 문자열로 변환 (parseHM 사용)
    // const laterTimeString = parseHM(laterTime.getTime());
    // console.log(`추가 확인 시간: ${laterTimeString}`);

    // interval 콜백 두 번째 실행
    act(() => {
      (global as any).intervalCallback();
    });

    // 중복 알림이 생성되지 않아야 함
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toHaveLength(1);

    // 이벤트 시작 시간으로 변경 (10:00)
    vi.setSystemTime(meetingTime);

    // 시간 문자열로 변환 (parseHM 사용)
    // const startTimeString = parseHM(meetingTime.getTime());
    // console.log(`이벤트 시작 시간: ${startTimeString}`);

    // interval 콜백 세 번째 실행
    act(() => {
      (global as any).intervalCallback();
    });

    // 여전히 중복 알림이 생성되지 않아야 함
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toHaveLength(1);
  });
});
