import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-05-28',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-05-28',
      startTime: '10:00',
      endTime: '14:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 5,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-05-28',
      startTime: '15:00',
      endTime: '16:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 30,
    },
  ];
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-05-28 09:50:00');
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);
    expect(upcomingEvents).toHaveLength(1);
    expect(upcomingEvents[0].title).toBe('이벤트 1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-05-28 09:55:00');
    const notifiedEvents: string[] = ['1'];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);
    expect(upcomingEvents).toHaveLength(1);
    expect(upcomingEvents[0].title).toBe('이벤트 2');
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-05-28 09:49:59');
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);
    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-05-28 15:00:01');
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);
    expect(upcomingEvents).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  const event: Event = {
    id: '1',
    title: '이벤트 1',
    date: '2025-05-28',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 10,
  };

  it('올바른 알림 메시지를 생성해야 한다', () => {
    const noti = createNotificationMessage(event);
    expect(noti).toBe('10분 후 이벤트 1 일정이 시작됩니다.');
  });
});
