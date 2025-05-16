import eventJson from '../../__mocks__/response/events.json';
import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
describe('getUpcomingEvents', () => {
  const baseEvent = {
    id: 'test-event',
    title: '테스트 이벤트',
    date: '2025-07-01',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  } as Event;

  const now = new Date('2025-07-01T10:00:00'); //10시

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const events = [
      {
        ...baseEvent,
        id: '1',
        startTime: '10:10',
      },
    ];

    const result = getUpcomingEvents(events, now, []);
    expect(result.some((e) => e.id === '1')).toBe(true);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events = [{ ...baseEvent, id: '3', startTime: '10:10' }];
    const result = getUpcomingEvents(events, now, ['3']);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events = [{ ...baseEvent, id: '5', startTime: '10:20' }];
    const result = getUpcomingEvents(events, now, []);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const nowTime = new Date('2025-07-01T10:16');
    const events = [{ ...baseEvent, id: '6', startTime: '10:04' }];
    const result = getUpcomingEvents(events, nowTime, []);
    expect(result).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const mockEvent = eventJson.events as Event[];
    const result = createNotificationMessage(mockEvent[0]);
    expect(result).toBe('10분 후 기존 회의 일정이 시작됩니다.');
  });
});
