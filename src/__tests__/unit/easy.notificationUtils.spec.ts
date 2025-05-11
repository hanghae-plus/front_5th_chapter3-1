import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { mockTestData, mockTestDataList } from '../data/mockTestData';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const events = mockTestDataList;
    const now = new Date('2025-05-02T10:45:00');
    const upcomingEvents = getUpcomingEvents(events, now, []);
    expect(upcomingEvents).toEqual([mockTestDataList[1]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events = mockTestDataList;
    const now = new Date('2025-05-02T11:00:00');
    const upcomingEvents = getUpcomingEvents(events, now, ['1']);
    expect(upcomingEvents).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events = mockTestDataList;
    const now = new Date('2025-05-02T10:00:00');
    const upcomingEvents = getUpcomingEvents(events, now, []);
    expect(upcomingEvents).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events = mockTestDataList;
    const now = new Date('2025-05-02T11:00:00');
    const upcomingEvents = getUpcomingEvents(events, now, []);
    expect(upcomingEvents).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = mockTestData;
    const message = createNotificationMessage(event);
    expect(message).toBe('10분 후 Event A 일정이 시작됩니다.');
  });
});
