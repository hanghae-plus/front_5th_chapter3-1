import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-05-13T09:50:00');
    const targetEvent: Event = {
      id: '1',
      title: '회의',
      date: '2025-05-13',
      startTime: '10:00',
      endTime: '11:00',
      location: '회의실 A',
      description: '회의 내용',
      category: '업무',
      notificationTime: 10,
      repeat: { type: 'none', interval: 0 },
    };
    const result = getUpcomingEvents([targetEvent], now, []);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 결과에서 제외한다', () => {
    const now = new Date('2025-05-13T09:50:00');
    const baseEvent: Event = {
      id: '1',
      title: '회의',
      date: '2025-05-13',
      startTime: '09:00',
      endTime: '10:00',
      location: '회의실',
      description: '회의 내용',
      category: '업무',
      notificationTime: 10,
      repeat: { type: 'none', interval: 0 },
    };
    const targetEvent: Event = {
      id: '2',
      title: '회의',
      date: '2025-05-13',
      startTime: '10:00',
      endTime: '11:00',
      location: '회의실 A',
      description: '회의 내용',
      category: '업무',
      notificationTime: 10,
      repeat: { type: 'none', interval: 0 },
    };
    const result = getUpcomingEvents([baseEvent, targetEvent], now, [baseEvent.id]);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-05-13T09:50:00');
    const baseEvent: Event = {
      id: '1',
      title: '회의',
      date: '2025-05-13',
      startTime: '09:00',
      endTime: '10:00',
      location: '회의실',
      description: '회의 내용',
      category: '업무',
      notificationTime: 10,
      repeat: { type: 'none', interval: 0 },
    };
    const targetEvent: Event = {
      id: '2',
      title: '회의',
      date: '2025-05-13',
      startTime: '10:00',
      endTime: '11:00',
      location: '회의실 A',
      description: '회의 내용',
      category: '업무',
      notificationTime: 10,
      repeat: { type: 'none', interval: 0 },
    };
    const result = getUpcomingEvents([baseEvent, targetEvent], now, [baseEvent.id]);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-05-13T10:05:00');
    const targetEvent: Event = {
      id: '1',
      title: '회의',
      date: '2025-05-13',
      startTime: '10:00',
      endTime: '11:00',
      location: '회의실 A',
      description: '회의 내용',
      category: '업무',
      notificationTime: 10,
      repeat: { type: 'none', interval: 0 },
    };
    const result = getUpcomingEvents([targetEvent], now, []);

    expect(result).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('이벤트의 예약 알림 시간과 제목이 포함된 알림 메시지를 생성한다', () => {
    const event: Event = {
      id: '1',
      title: '회의',
      date: '2025-05-13',
      startTime: '10:00',
      endTime: '11:00',
      location: '회의실 A',
      description: '회의 내용',
      category: '업무',
      notificationTime: 10,
      repeat: { type: 'none', interval: 0 },
    };
    const result = createNotificationMessage(event);

    expect(result).toBe('10분 후 회의 일정이 시작됩니다.');
  });
});
