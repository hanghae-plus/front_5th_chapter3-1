import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-05-15T09:50:00');
    const events = [
      {
        id: '1',
        title: '곧 시작되는 회의',
        date: '2025-05-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '정기 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10 // 10분 전 알림
      },
      {
        id: '2',
        title: '나중 회의',
        date: '2025-05-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 회의',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30 // 30분 전 알림
      }
    ];

    const notifiedEvents = [];
    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result.length).toBe(1);
    expect(result[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-05-15T09:50:00');
    const events = [
      {
        id: '1',
        title: '곧 시작되는 회의',
        date: '2025-05-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '정기 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10 // 10분 전 알림
      },
      {
        id: '2',
        title: '나중 회의',
        date: '2025-05-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 회의',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30 // 30분 전 알림
      }
    ];

    const notifiedEvents = ['1']; // 이미 알림이 간 이벤트
    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result.length).toBe(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-05-15T09:30:00');
    const events = [
      {
        id: '1',
        title: '곧 시작되는 회의',
        date: '2025-05-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '정기 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10 // 10분 전 알림 (아직 도래하지 않음)
      }
    ];

    const notifiedEvents = [];
    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result.length).toBe(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-05-15T10:05:00');
    const events = [
      {
        id: '1',
        title: '이미 시작된 회의',
        date: '2025-05-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '정기 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10 // 10분 전 알림 (이미 지남)
      }
    ];

    const notifiedEvents = [];
    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result.length).toBe(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = {
      id: '1',
      title: '중요 회의',
      date: '2025-05-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '프로젝트 검토',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10
    };

    const message = createNotificationMessage(event);

    expect(message).toBe('10분 후 중요 회의 일정이 시작됩니다.');

    const anotherEvent = {
      id: '2',
      title: '팀 미팅',
      date: '2025-05-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '주간 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30
    };

    const anotherMessage = createNotificationMessage(anotherEvent);

    expect(anotherMessage).toBe('30분 후 팀 미팅 일정이 시작됩니다.');
  });
});
