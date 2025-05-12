import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const common: Event = {
    id: '',
    title: '이벤트',
    date: '2025-05-12',
    startTime: '',
    endTime: '',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  };
  const events: Event[] = [
    { ...common, id: '1', startTime: '09:00', endTime: '10:00', notificationTime: 10 },
    { ...common, id: '2', startTime: '10:00', endTime: '11:00', notificationTime: 20 },
    { ...common, id: '3', startTime: '11:00', endTime: '12:00', notificationTime: 70 },
    { ...common, id: '4', startTime: '13:00', endTime: '14:00', notificationTime: 20 },
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const upcomingEvents = getUpcomingEvents(events, new Date('2025-05-12T08:50:00'), []); // "1"
    expect(upcomingEvents.length).toBe(1);
    expect(upcomingEvents[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const upcomingEvents = getUpcomingEvents(events, new Date('2025-05-12T09:50:00'), ['2']); // "2", "3"
    expect(upcomingEvents.length).toBe(1);
    expect(upcomingEvents[0].id).toBe('3');
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const upcomingEvents = getUpcomingEvents(events, new Date('2025-05-12T12:30:00'), []); // "4"
    expect(upcomingEvents.length).toBe(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const upcomingEvents = getUpcomingEvents(events, new Date('2025-05-12T12:10:00'), []); // "1", "2", "3"
    expect(upcomingEvents.length).toBe(0);
  });
});

describe('createNotificationMessage', () => {
  const event: Event = {
    id: '1',
    title: '이벤트',
    date: '2025-05-12',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const notificationMessage = createNotificationMessage(event);
    expect(notificationMessage).toBe('10분 후 이벤트 일정이 시작됩니다.');
  });
});
