import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { MOCK_EVENTS } from '../mock';

describe('getUpcomingEvents', () => {
  const now = new Date('2025-05-01T09:00:00');

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const result = getUpcomingEvents(MOCK_EVENTS, now, []);
    expect(result).toEqual([MOCK_EVENTS[0]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const result = getUpcomingEvents(MOCK_EVENTS, now, ['1']);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const futureEvent = { ...MOCK_EVENTS[0], startTime: '09:20' }; // 알림 시간은 20분 후
    const result = getUpcomingEvents([futureEvent], now, []);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const pastEvent = { ...MOCK_EVENTS[0], startTime: '08:50' }; // 이미 시작함
    const result = getUpcomingEvents([pastEvent], now, []);
    expect(result).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const message = createNotificationMessage(MOCK_EVENTS[0]);
    expect(message).toBe('1분 후 이벤트 1 일정이 시작됩니다.');
  });
});
