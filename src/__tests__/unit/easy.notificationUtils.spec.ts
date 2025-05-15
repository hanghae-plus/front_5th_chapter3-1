import { createNotificationMessage, getUpcomingEvents } from '../../shared/lib/notificationUtils';
import { Event } from '../../types';

describe('getUpcomingEvents', () => {
  // 기준 시간: 2025-07-01T10:00:00
  const now = new Date('2025-07-01T10:00:00');

  // 테스트용 이벤트 배열
  const events: Event[] = [
    {
      id: '1',
      date: '2025-07-01',
      startTime: '10:10', // 10분 후, notificationTime 15분 → 포함 ✅
      endTime: '11:00',
      title: '회의',
      description: '',
      location: '',
      category: '',
      repeat: undefined,
      notificationTime: 15,
    },
    {
      id: '2',
      date: '2025-07-01',
      startTime: '10:05', // 5분 후, notificationTime 10분이지만 이미 알림 발송됨 → 제외 ❌
      endTime: '10:45',
      title: '점검',
      description: '',
      location: '',
      category: '',
      repeat: undefined,
      notificationTime: 10,
    },
    {
      id: '3',
      date: '2025-07-01',
      startTime: '10:50', // 50분 후, notificationTime 15분 → 너무 멀음 → 제외 ❌
      endTime: '11:30',
      title: '브리핑',
      description: '',
      location: '',
      category: '',
      repeat: undefined,
      notificationTime: 15,
    },
    {
      id: '4',
      date: '2025-07-01',
      startTime: '09:50', // 이미 시작 → timeDiff < 0 → 제외 ❌
      endTime: '10:30',
      title: '지난 일정',
      description: '',
      location: '',
      category: '',
      repeat: undefined,
      notificationTime: 20,
    },
  ];

  const notifiedEvents = ['2']; // '점검' 일정은 이미 알림 발송됨

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result.map((e) => e.id)).toEqual(['1']);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const result = getUpcomingEvents(events, now, notifiedEvents);

    // '2'번은 notifiedEvents에 있으므로 포함되면 안 됨
    const ids = result.map((e) => e.id);
    expect(ids).not.toContain('2');
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const result = getUpcomingEvents(events, now, notifiedEvents);

    // '3'번은 시작까지 50분 남았지만 notificationTime은 15분 → 포함되면 안 됨
    const ids = result.map((e) => e.id);
    expect(ids).not.toContain('3');
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const result = getUpcomingEvents(events, now, notifiedEvents);

    // '4'번은 이미 시작된 이벤트 → 포함되면 안 됨
    const ids = result.map((e) => e.id);
    expect(ids).not.toContain('4');
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      notificationTime: 30,
      title: '사랑의 하츄핑',
      id: '',
      date: '',
      startTime: '',
      endTime: '',
      description: '',
      location: '',
      category: '',
    };
    const result = createNotificationMessage(event);

    expect(result).toBe('30분 후 사랑의 하츄핑 일정이 시작됩니다.');
  });
});
