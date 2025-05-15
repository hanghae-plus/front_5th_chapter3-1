import { upcomingTestEvents } from '../../__mocks__/fixtures';
import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-07-01T09:30:00');

    const result = getUpcomingEvents(upcomingTestEvents, now, []);
    expect(result).toEqual([upcomingTestEvents[0]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-05-10T13:30:00');
    const notifiedEvents: string[] = ['1'];

    const result = getUpcomingEvents(upcomingTestEvents, now, notifiedEvents);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-07-01T09:30:00');
    const result = getUpcomingEvents(upcomingTestEvents, now, []);
    expect(result).toEqual([upcomingTestEvents[0]]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-07-01T10:30:00');
    const result = getUpcomingEvents(upcomingTestEvents, now, []);
    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 1 설명',
      location: '이벤트 1 장소',
      category: '이벤트 1 카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const result = createNotificationMessage(event);
    expect(result).toBe('30분 후 이벤트 1 일정이 시작됩니다.');
  });
});
