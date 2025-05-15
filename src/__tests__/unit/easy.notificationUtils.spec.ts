import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { getTestEvents } from '../fixtures/eventFactory';

const events = getTestEvents('notification');

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-05-10T13:30:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-05-10T13:30:00');
    const notifiedEvents: string[] = ['1'];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-05-10T11:40:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-05-10T11:55:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const message = createNotificationMessage(events[0]);

    expect(message).toBe('30분 후 중요 회의 일정이 시작됩니다.');
  });
});
