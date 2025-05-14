import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const baseEvent: Event = {
    id: '1',
    title: '팀 회의',
    date: '2025-05-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10, // 10분 전 알림
  };
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    // 10:00 시작 이벤트, 현재 시간 9:51 (시작 9분 전)
    const events: Event[] = [
      { ...baseEvent, id: '1', startTime: '10:00', notificationTime: 10 },
      { ...baseEvent, id: '2', startTime: '11:00', notificationTime: 10 },
      { ...baseEvent, id: '3', startTime: '12:00', notificationTime: 5 },
    ];

    // 현재 시간을 9:51로 설정 (이벤트 1은 알림 시간 도래, 나머지는 아직)
    const now = new Date(`${baseEvent.date}T09:51:00`);
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    // id '1'만 알림 시간 도래 (10:00 - 10분 = 9:50, 현재 9:51이므로 알림 범위 내)
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events: Event[] = [
      { ...baseEvent, id: '1', startTime: '10:00', notificationTime: 10 },
      { ...baseEvent, id: '2', startTime: '11:00', notificationTime: 70 },
    ];

    const now = new Date(`${baseEvent.date}T09:51:00`);

    const notifiedEvents: string[] = ['1'];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events: Event[] = [{ ...baseEvent, id: '1', startTime: '10:00', notificationTime: 10 }];

    // 현재 시간을 9:49로 설정 (알림 시간 도래 안 됨, 9:50이 알림 시간)
    const now = new Date(`${baseEvent.date}T09:49:00`);
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    // 알림 시간 도래 안 됨 -> 빈 배열
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events: Event[] = [{ ...baseEvent, id: '1', startTime: '10:00', notificationTime: 10 }];

    // 현재 시간을 10:01로 설정 (이벤트 시작 시간 이후)
    const now = new Date(`${baseEvent.date}T10:01:00`);
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    // 이벤트 시작 시간이 지났으므로 빈 배열
    expect(result).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '팀 회의',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const message = createNotificationMessage(event);

    // 예상 메시지: "10분 후 팀 회의 일정이 시작됩니다."
    expect(message).toBe('10분 후 팀 회의 일정이 시작됩니다.');
  });
});
