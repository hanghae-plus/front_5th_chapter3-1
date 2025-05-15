import { events } from '../../__mocks__/response/mockEvents.json' assert { type: 'json' };
import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const MOCK_EVENTS = [...events] as Event[];

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    expect(getUpcomingEvents(MOCK_EVENTS, new Date('2025-07-01 08:50'), [])).toHaveLength(1);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    expect(getUpcomingEvents(MOCK_EVENTS, new Date('2025-05-01 09:00'), ['1'])).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(MOCK_EVENTS, new Date('2025-10-01 09:00'), [])).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(MOCK_EVENTS, new Date('2025-05-01 09:00'), [])).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    expect(createNotificationMessage(MOCK_EVENTS[0])).toBe('10분 후 기존 회의 일정이 시작됩니다.');
  });
});
