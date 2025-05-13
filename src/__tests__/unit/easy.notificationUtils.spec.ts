import eventJson from '../../__mocks__/response/events.json';
import { Event } from '../../types';
import { createNotificationMessage } from '../../utils/notificationUtils';
describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {});

  it('이미 알림이 간 이벤트는 제외한다', () => {});

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {});

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {});
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const mockEvent = eventJson.events as Event[];
    const result = createNotificationMessage(mockEvent[0]);
    expect(result).toBe('10분 후 기존 회의 일정이 시작됩니다.');
  });
});
