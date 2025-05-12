import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const events: Event[] = [
  {
    id: '1',
    title: '저녁 약속',
    date: '2025-05-12',
    startTime: '18:00',
    endTime: '19:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15,
  },
  {
    id: '2',
    title: '달리기',
    date: '2025-05-12',
    startTime: '21:00',
    endTime: '22:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15,
  },
];

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-05-12T17:45:00');
    const upcomingEvents = getUpcomingEvents(events, now, []);
    expect(upcomingEvents).toEqual([
      {
        id: '1',
        title: '저녁 약속',
        date: '2025-05-12',
        startTime: '18:00',
        endTime: '19:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 15,
      },
    ]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-05-12T20:45:00');
    const upcomingEvents = getUpcomingEvents(events, now, ['1']);
    expect(upcomingEvents).toEqual([
      {
        id: '2',
        title: '달리기',
        date: '2025-05-12',
        startTime: '21:00',
        endTime: '22:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 15,
      },
    ]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-05-12T11:00:00');
    const upcomingEvents = getUpcomingEvents(events, now, []);
    expect(upcomingEvents).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-05-12T20:45:00');
    const upcomingEvents = getUpcomingEvents(events, now, ['1']);
    expect(upcomingEvents).toEqual([
      {
        id: '2',
        title: '달리기',
        date: '2025-05-12',
        startTime: '21:00',
        endTime: '22:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 15,
      },
    ]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const now = new Date('2025-05-12T17:45:00');
    const upcomingEvents = getUpcomingEvents(events, now, []);
    const message = createNotificationMessage(upcomingEvents[0]);
    expect(message).toBe('15분 후 저녁 약속 일정이 시작됩니다.');
  });
});
