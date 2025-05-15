import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '14일 일정입니다.',
    date: '2025-05-14',
    startTime: '22:00',
    endTime: '22:30',
    description: '14일 일정 설명',
    location: '집',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '15일 일정',
    date: '2025-05-15',
    startTime: '03:00',
    endTime: '04:00',
    description: '15일 일정 설명',
    location: '집',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 15,
  },
  {
    id: '3',
    title: '16일 일정',
    date: '2025-05-16',
    startTime: '09:00',
    endTime: '10:00',
    description: '16일 일정 설명',
    location: '집',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 20,
  },
];

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-05-14T21:50:00');
    const notifiedEvents: string[] = [];
    const upcomingEvent = getUpcomingEvents(mockEvents, now, notifiedEvents);
    expect(upcomingEvent).toHaveLength(1);
    expect(upcomingEvent[0].title).toBe('14일 일정입니다.');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-05-14T22:10:00');
    const notifiedEvents: string[] = ['1'];
    const upcomingEvent = getUpcomingEvents(mockEvents, now, notifiedEvents);
    expect(upcomingEvent).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-05-16T08:00:00');
    const notifiedEvents: string[] = [];
    const upcomingEvent = getUpcomingEvents(mockEvents, now, notifiedEvents);
    expect(upcomingEvent).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-05-15T05:00:00');
    const notifiedEvents: string[] = [];
    const upcomingEvent = getUpcomingEvents(mockEvents, now, notifiedEvents);
    expect(upcomingEvent).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const notificationMessage = createNotificationMessage(mockEvents[0]);
    console.log(notificationMessage);
    expect(notificationMessage).toBe('10분 후 14일 일정입니다. 일정이 시작됩니다.');
  });
});
