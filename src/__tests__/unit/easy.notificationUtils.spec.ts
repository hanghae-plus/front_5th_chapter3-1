import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

// 총 5개

const events: Event[] = [
  {
    id: '1',
    title: '야식 시간',
    date: '2025-05-12',
    startTime: '22:00',
    endTime: '23:00',
    description: '지코바 너로 정했다!',
    location: '거실',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 30,
  },
  {
    id: '2',
    title: '잘 시간',
    date: '2025-05-13',
    startTime: '03:00',
    endTime: '04:00',
    description: '자야돼,,,자야돼',
    location: '침대',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 15,
  },
  {
    id: '3',
    title: '병원 진료',
    date: '2025-05-13',
    startTime: '09:00',
    endTime: '10:00',
    description: '난 쉬고싶은데',
    location: '경희대병원',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 60,
  },
];

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-05-12T21:30:00');
    const notifiedEvents: string[] = [];
    const upcoming = getUpcomingEvents(events, now, notifiedEvents);
    expect(upcoming).toHaveLength(1);
    expect(upcoming[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-05-12T22:00:00');
    const notifiedEvents: string[] = ['1'];
    const upcoming = getUpcomingEvents(events, now, notifiedEvents);
    expect(upcoming).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-05-12T23:00:00');
    const notifiedEvents: string[] = [];
    const upcoming = getUpcomingEvents(events, now, notifiedEvents);
    expect(upcoming).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-05-12T22:00:00');
    const notifiedEvents: string[] = [];
    const upcoming = getUpcomingEvents(events, now, notifiedEvents);
    expect(upcoming).toHaveLength(0);
    expect(upcoming.some((event) => event.id === '1')).toBe(false);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '4',
      title: '햄버거 먹을 시간입니다',
      date: '2025-05-12',
      startTime: '22:00',
      endTime: '23:00',
      description: '',
      location: '거실',
      category: '식사',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const message = createNotificationMessage(event);
    expect(message).toBe('10분 후 햄버거 먹을 시간입니다 일정이 시작됩니다.');
  });
});
