import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const mockSchedule: Event = {
  id: '1',
  title: '강아지 산책 시간',
  date: '2025-10-18',
  startTime: '11:00',
  endTime: '14:00',
  description: '',
  location: '',
  category: '',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 30,
};

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-10-18T10:30');
    const result = getUpcomingEvents([mockSchedule], now, []);
    expect(result).toEqual([mockSchedule]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-10-18T10:30');
    const result = getUpcomingEvents([mockSchedule], now, ['1']);
    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-10-18T10:00'); // 60분 남음
    const result = getUpcomingEvents([mockSchedule], now, []);
    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-10-18T10:00'); // 60분 전
    const result = getUpcomingEvents([mockSchedule], now, []);
    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const message = createNotificationMessage(mockSchedule);
    expect(message).toBe('30분 후 강아지 산책 시간 일정이 시작됩니다.');
  });
});
