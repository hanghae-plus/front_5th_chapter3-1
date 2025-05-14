import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const events: Event[] = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2025-05-01',
    startTime: '14:30',
    endTime: '15:30',
    description: '이벤트 1 설명',
    location: '이벤트 1 위치',
    category: '이벤트 1 카테고리',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 1,
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2025-05-02',
    startTime: '14:30',
    endTime: '15:30',
    description: '이벤트 2 설명',
    location: '이벤트 2 위치',
    category: '이벤트 2 카테고리',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 1,
  },
  {
    id: '3',
    title: '이벤트 3',
    date: '2025-05-03',
    startTime: '14:30',
    endTime: '15:30',
    description: '이벤트 3 설명',
    location: '이벤트 3 위치',
    category: '이벤트 3 카테고리',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 1,
  },
];

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    // 정확히 도래한 이벤트
    const result = getUpcomingEvents(events, new Date('2025-05-02 14:29'), []);
    console.log('🚀 ~ it ~ result', result);
    expect(result).toEqual([events[1]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const result = getUpcomingEvents(events, new Date('2025-05-02 14:29'), ['2']);
    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const result = getUpcomingEvents(events, new Date('2025-05-02 14:30'), []);
    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const result = getUpcomingEvents(events, new Date('2025-05-02 14:31'), []);
    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const result1 = createNotificationMessage(events[0]);
    expect(result1).toBe('1분 후 이벤트 1 일정이 시작됩니다.');

    const result2 = createNotificationMessage(events[1]);
    expect(result2).toBe('1분 후 이벤트 2 일정이 시작됩니다.');

    const result3 = createNotificationMessage(events[2]);
    expect(result3).toBe('1분 후 이벤트 3 일정이 시작됩니다.');
  });
});
