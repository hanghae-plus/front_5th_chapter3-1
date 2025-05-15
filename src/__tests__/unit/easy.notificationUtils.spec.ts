import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const baseTime = new Date('2025-05-12T12:00');

  const makeEvent = (override: Partial<Event>): Event => ({
    id: '1',
    title: 'test',
    date: '2025-05-12',
    startTime: '12:10',
    endTime: '12:30',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
    ...override,
  });

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const events = [makeEvent({ id: '1', startTime: '12:10', notificationTime: 10 })];
    const result = getUpcomingEvents(events, baseTime, []);
    expect(result.map((e) => e.id)).toContain('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events = [makeEvent({ id: '2', startTime: '12:10', notificationTime: 10 })];
    const result = getUpcomingEvents(events, baseTime, ['2']);
    expect(result.map((e) => e.id)).not.toContain('2');
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events = [makeEvent({ id: '3', startTime: '12:00', notificationTime: 5 })];
    const result = getUpcomingEvents(events, baseTime, []);
    expect(result.map((e) => e.id)).not.toContain('3');
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events = [makeEvent({ id: '4', startTime: '12:31', notificationTime: 10 })];
    const result = getUpcomingEvents(events, baseTime, []);
    expect(result.map((e) => e.id)).not.toContain('4');
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Partial<Event> = {
      title: '회의',
      notificationTime: 15,
    };

    const message = createNotificationMessage(event as Event);
    expect(message).toBe('15분 후 회의 일정이 시작됩니다.');
  });
});
