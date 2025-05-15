import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { MOCK_DATA } from '../mock';

describe('getUpcomingEvents', () => {
  const events = MOCK_DATA;
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    expect(
      getUpcomingEvents(
        events,
        new Date('2025-05-20T10:00'),
        events.map(({ id }) => id)
      )
    ).toEqual([]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    expect(
      getUpcomingEvents(
        events,
        new Date('2025-01-01T10:00'),
        events.map(({ id }) => id)
      )
    ).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    expect(
      getUpcomingEvents(
        events,
        new Date('2026-01-01T10:00'),
        events.map(({ id }) => id)
      )
    ).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    expect(
      getUpcomingEvents(
        events,
        new Date('2024-01-01T10:00'),
        events.map(({ id }) => id)
      )
    ).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = MOCK_DATA[0];
    expect(
      createNotificationMessage({ notificationTime: event.notificationTime, title: event.title })
    ).toBe('1분 후 team 회의 일정이 시작됩니다.');
  });
});
