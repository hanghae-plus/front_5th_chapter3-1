import { sampleEvents } from '../../__mocks__/mocksData';
import { createNotificationMessage, getUpcomingEvents } from '../../shared/utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const events = sampleEvents;
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    // 이벤트 시작 30분 전 시점
    const now = new Date('2024-03-01T09:50:00');
    const notifiedEvents: string[] = [];

    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    expect(upcomingEvents).toHaveLength(1);
    expect(upcomingEvents[0]).toEqual(sampleEvents[0]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2024-03-01T09:50:00');
    const notifiedEvents = ['1']; // 첫 번째 이벤트 ID

    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2024-03-01T09:45:00'); // 15분 전
    const notifiedEvents: string[] = [];

    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2024-03-01T09:55:00'); // 5분 전
    const notifiedEvents: string[] = ['1'];

    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    expect(upcomingEvents).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    // 테스트용 이벤트 객체들
    const testCases = [
      {
        event: sampleEvents[0], // 팀 주간 미팅, 10분 전 알림
        expected: '10분 후 팀 주간 미팅 일정이 시작됩니다.',
      },
      {
        event: sampleEvents[1], // 점심 약속, 5분 전 알림
        expected: '5분 후 점심 약속 일정이 시작됩니다.',
      },
      {
        event: sampleEvents[4], // 생일 파티, 60분 전 알림
        expected: '60분 후 생일 파티 일정이 시작됩니다.',
      },
    ];

    // 각 테스트 케이스 실행
    testCases.forEach(({ event, expected }) => {
      const message = createNotificationMessage(event);
      expect(message).toBe(expected);
    });
  });
});
