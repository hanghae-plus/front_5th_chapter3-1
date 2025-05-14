import eventsData from '../../__mocks__/response/events.json';
import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
describe('getUpcomingEvents', () => {
  const events = eventsData.events as Event[];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-10-15T08:51:00');
    const result = getUpcomingEvents(events, now, []);

    expect(result.map((event) => event.id)).toContain('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-10-15T08:51:00');
    const result = getUpcomingEvents(events, now, ['1']);

    expect(result.map((event) => event.id)).not.toContain('1');
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-10-15T08:30:00');
    const result = getUpcomingEvents(events, now, []);

    expect(result.map((event) => event.id)).not.toContain('1');
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-10-15T09:30:00');
    const result = getUpcomingEvents(events, now, []);

    expect(result.map((event) => event.id)).not.toContain('1');
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '100',
      title: '스터디 모임',
      date: '2025-12-01',
      startTime: '20:00',
      endTime: '21:30',
      description: '개인 프로젝트 스터디',
      location: '온라인',
      category: '스터디',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    };
    const result = createNotificationMessage(event);

    expect(result).toBe('15분 후 스터디 모임 일정이 시작됩니다.');
  });
});
