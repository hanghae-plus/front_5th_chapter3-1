import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const sampleEvents: Event[] = [
  {
    id: '1',
    title: '회의',
    description: '',
    location: '',
    category: '',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '11:00',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
  {
    id: '2',
    title: '점심약속',
    description: '',
    location: '',
    category: '',
    date: '2025-07-01',
    startTime: '12:00',
    endTime: '13:00',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-07-01T09:30');
    const result = getUpcomingEvents(sampleEvents, now, []);
    expect(result.map((e) => e.id)).toContain('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-07-01T09:30');
    const result = getUpcomingEvents(sampleEvents, now, ['1']);
    expect(result.map((e) => e.id)).not.toContain('1');
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-07-01T11:45');
    const result = getUpcomingEvents(sampleEvents, now, []);
    expect(result.map((e) => e.id)).not.toContain('2');
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-07-01T10:01');
    const result = getUpcomingEvents(sampleEvents, now, []);
    expect(result.map((e) => e.id)).not.toContain('1');
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const message = createNotificationMessage(sampleEvents[0]);
    expect(message).toBe('30분 후 회의 일정이 시작됩니다.');
  });
});
