import { Event } from '../../types';
import { getUpcomingEvents } from '../../utils/notificationUtils';

const events: Event[] = [
  {
    id: '7a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p',
    title: '이벤트 2',
    date: '2025-07-02',
    startTime: '09:00',
    endTime: '18:00',
    description: '제주도 여행',
    location: '제주도',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '9b8c7d6e-5f4g-3h2i-1j0k-9l8m7n6o5p4',
    title: 'Test Title',
    date: '2025-07-01',
    startTime: '14:00',
    endTime: '16:00',
    description: '상반기 성과 회고 및 하반기 계획',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6',
    title: '가족 모임',
    date: '2025-07-31',
    startTime: '12:00',
    endTime: '15:00',
    description: '가족 모임 및 점심 식사',
    location: '가족 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7',
    title: '신입사원 교육',
    date: '2025-07-10',
    startTime: '10:00',
    endTime: '17:00',
    description: '신입사원 온보딩 교육',
    location: '교육장',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
];

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const result = getUpcomingEvents(events, new Date('2025-07-01 13:59'), []);
    expect(result).toEqual([events[1]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const result = getUpcomingEvents(events, new Date('2025-07-01 13:59'), [events[1].id]);
    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const result = getUpcomingEvents(events, new Date('2025-07-01 13:58'), []);
    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const result = getUpcomingEvents(events, new Date('2025-07-01 14:01'), []);
    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {});
});
