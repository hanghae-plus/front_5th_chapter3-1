import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 1 설명',
      location: '서울',
      category: '카테고리 1',
      repeat: {
        type: 'daily',
        interval: 1,
      },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 2 설명',
      location: '서울',
      category: '카테고리 2',
      repeat: {
        type: 'daily',
        interval: 1,
      },
      notificationTime: 5,
    },
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const result = getUpcomingEvents(events, new Date('2025-07-01T09:50:00'), []);
    expect(result).toStrictEqual([events[0]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const notifiedEvents = ['1'];
    const result = getUpcomingEvents(events, new Date('2025-07-01T09:55:00'), notifiedEvents);
    expect(result).toStrictEqual([events[1]]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const result = getUpcomingEvents(events, new Date('2025-07-01T09:00:00'), []);
    expect(result).toStrictEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const result = getUpcomingEvents(events, new Date('2025-07-01T10:00:00'), []);
    expect(result).toStrictEqual([]);
  });
});

describe('createNotificationMessage', () => {
  const event: Event = {
    id: '1',
    title: '이벤트 1',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '이벤트 1 설명',
    location: '서울',
    category: '카테고리 1',
    repeat: {
      type: 'daily',
      interval: 1,
    },
    notificationTime: 10,
  };
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const result = createNotificationMessage(event);
    expect(result).toBe('10분 후 이벤트 1 일정이 시작됩니다.');
  });
});
