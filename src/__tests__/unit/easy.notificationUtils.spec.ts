import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

// 현재 시간 설정 (기준점)
// const currentTime = new Date().getTime();
const currentTime = new Date('2024-07-01T14:25:00');

// 테스트용 이벤트 데이터 생성
const events: Event[] = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2024-07-01',
    startTime: '14:30',
    endTime: '15:30',
    description: '설명',
    location: '장소',
    category: '테고리',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 5,
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2024-07-02',
    startTime: '15:30',
    endTime: '16:30',
    description: '설명2',
    location: '장소2',
    category: '카테고리2',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  },
];

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    // 함수 호출
    const result = getUpcomingEvents(events, currentTime, []);
    expect(result).toEqual([events[0]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const result = getUpcomingEvents(events, currentTime, [events[0].id]);
    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const currentTimeForTest = new Date('2024-07-01T14:20:00');

    const result = getUpcomingEvents(events, currentTimeForTest, []);
    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const currentTimeForTest = new Date('2024-07-01T14:30:00');

    const result = getUpcomingEvents(events, currentTimeForTest, []);
    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const result = createNotificationMessage(events[0]);
    expect(result).toBe('5분 후 이벤트 1 일정이 시작됩니다.');
  });
});
