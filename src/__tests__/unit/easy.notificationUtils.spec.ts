import { Event, RepeatType } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

function makeEvent(id: string, updatedProperty: Partial<Event> = {}): Event {
  const defaultEvent = {
    id: id,
    title: `이벤트 ${id}`,
    date: formatDate(new Date()),
    startTime: '10:00',
    endTime: '11:00',
    description: `이벤트 ${id} 설명`,
    location: `이벤트 ${id} 장소`,
    category: `이벤트 ${id} 카테고리`,
    repeat: {
      type: 'none' as RepeatType,
      interval: 0,
    },
    notificationTime: 20,
  };
  return { ...defaultEvent, ...updatedProperty };
}

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const event1 = makeEvent('1', { date: '2025-05-01', startTime: '10:00', endTime: '11:00' });
    const event2 = makeEvent('2', { date: '2025-05-02', startTime: '10:00', endTime: '11:00' });
    const event3 = makeEvent('3', { date: '2025-05-02', startTime: '11:00', endTime: '12:00' });
    const notifiedEvents = ['id1'];
    const now = new Date('2025-05-02T09:50');
    const events = [event1, event2, event3];
    expect(getUpcomingEvents(events, now, notifiedEvents)).toEqual([event2]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const event1 = makeEvent('1', { date: '2025-05-01', startTime: '10:00', endTime: '11:00' });
    const event2 = makeEvent('2', { date: '2025-05-02', startTime: '10:00', endTime: '11:00' });
    const event3 = makeEvent('3', { date: '2025-05-02', startTime: '10:00', endTime: '12:00' });
    const notifiedEvents = ['2'];
    const now = new Date('2025-05-02T09:50');
    const events = [event1, event2, event3];
    expect(getUpcomingEvents(events, now, notifiedEvents)).toEqual([event3]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const event1 = makeEvent('1', { date: '2025-05-01', startTime: '10:00', endTime: '11:00' });
    const event2 = makeEvent('2', { date: '2025-05-02', startTime: '10:00', endTime: '11:00' });
    const event3 = makeEvent('3', { date: '2025-05-02', startTime: '12:00', endTime: '12:00' });
    const notifiedEvents = ['id1'];
    const now = new Date('2025-05-02T09:50');
    const events = [event1, event2, event3];
    expect(getUpcomingEvents(events, now, notifiedEvents)).toEqual([event2]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const event1 = makeEvent('1', { date: '2025-05-01', startTime: '10:00', endTime: '11:00' });
    const event2 = makeEvent('2', { date: '2025-05-02', startTime: '10:00', endTime: '11:00' });
    const notifiedEvents = ['id1'];
    const now = new Date('2025-05-02T09:50');
    const events = [event1, event2];
    expect(getUpcomingEvents(events, now, notifiedEvents)).toEqual([event2]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = makeEvent('1', { notificationTime: 20, title: '이벤트 1' });
    expect(createNotificationMessage(event)).toBe('20분 후 이벤트 1 일정이 시작됩니다.');
  });
});
