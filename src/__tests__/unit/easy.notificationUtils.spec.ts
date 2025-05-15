import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const events: Event[] = [
  {
    category: '업무',
    date: '2025-05-20',
    id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
    title: '팀 회의',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A"',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    category: '개인',
    date: '2025-05-21',
    id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
    title: '팀 회의',
    startTime: '10:00',
    endTime: '13:30',
    description: '동료와 점심 식사',
    location: '회사 근처 식당"',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

describe('getUpcomingEvents', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const date = new Date('2025-05-21T09:50:00');
    const result = getUpcomingEvents(events, date, []);
    expect(result).toHaveLength(1);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const date = new Date('2025-05-21T10:10:00');
    vi.setSystemTime(date);
    const upcomingEvents = getUpcomingEvents(events, new Date(), ['1']);
    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const date = new Date('2025-05-21T09:40:00');
    vi.setSystemTime(date);
    const upcomingEvents = getUpcomingEvents(events, new Date(), []);
    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const date = new Date('2025-05-22T09:40:00');
    vi.setSystemTime(date);
    const upcomingEvents = getUpcomingEvents(events, new Date(), []);
    expect(upcomingEvents).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const result = createNotificationMessage(events[0]);
    expect(result).toBe('10분 후 팀 회의 일정이 시작됩니다.');
  });
});
