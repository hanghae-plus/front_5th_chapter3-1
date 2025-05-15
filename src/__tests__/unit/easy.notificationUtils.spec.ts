import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      description: '이벤트 설명 1',
      location: '장소 1',
      category: '카테고리 1',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-02',
      startTime: '16:00',
      endTime: '17:00',
      description: '이벤트 설명 2',
      location: '장소 2',
      category: '카테고리 2',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
  ];
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const currentDate = new Date('2025-07-01T14:29');
    const result = getUpcomingEvents(events, currentDate, []);

    expect(result).toEqual([events[0]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const currentDate = new Date('2025-07-01T14:29');
    const notifiedEvents = ['1'];
    const result = getUpcomingEvents(events, currentDate, notifiedEvents);

    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const currentDate = new Date('2025-07-01T14:20');
    const result = getUpcomingEvents(events, currentDate, []);

    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const currentDate = new Date('2025-07-01T14:35');
    const result = getUpcomingEvents(events, currentDate, []);

    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      description: '이벤트 설명 1',
      location: '장소 1',
      category: '카테고리 1',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    };

    const message = createNotificationMessage(event);
    expect(message).toBe('5분 후 이벤트 1 일정이 시작됩니다.');
  });
});
