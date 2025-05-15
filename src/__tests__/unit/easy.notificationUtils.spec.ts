import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const events: Event[] = [
    {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
      title: '점심 약속',
      date: '2025-05-21',
      startTime: '12:30',
      endTime: '13:30',
      description: '동료와 점심 식사',
      location: '회사 근처 식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-05-20T09:59:00');
    const notifiedEvents: string[] = [];
    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result[0].title).toBe('팀 회의');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-05-20T09:59:00');
    const notifiedEvents: string[] = ['2b7545a6-ebee-426c-b906-2329bc8d62bd'];
    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-05-20T09:00:00');
    const notifiedEvents: string[] = [];
    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-05-20T10:01:00');
    const notifiedEvents: string[] = [];
    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const events: Event[] = [
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '팀 회의',
        date: '2025-05-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];
    const message = createNotificationMessage(events[0]);
    expect(message).toBe('1분 후 팀 회의 일정이 시작됩니다.');
  });
});
