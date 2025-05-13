// ... (기존 import문)
import { Event } from '../../types'; // 경로 확인
import { createNotificationMessage } from '../../utils/notificationUtils';
import { getUpcomingEvents } from '../../utils/notificationUtils'; // 경로 확인
import dummyEvents from '../dummy/dummyNotificationEvents.json' assert { type: 'json' }; // 수정된 더미 데이터 import

describe('getUpcomingEvents', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-08-15T13:30:00'));
  });

  // 각 테스트 후에 실제 시간으로 복구
  afterEach(() => {
    vi.useRealTimers();
  });

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const result = getUpcomingEvents(dummyEvents.events as Event[], new Date(), []);

    const expectedEvents = [dummyEvents.events[0]];

    expect(result.map((e) => e.id).sort()).toEqual(expectedEvents.map((e) => e.id).sort());
  });

  it('이미 알림을 보낸 이벤트는 제외한다', () => {
    const result = getUpcomingEvents([dummyEvents.events[2] as Event], new Date(), []);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트(미래)는 반환하지 않는다', () => {
    const result = getUpcomingEvents(dummyEvents.events as Event[], new Date(), []);
    expect(result.find((event) => event.id === 'NOTIF002')).toBeUndefined();
  });

  it('알림 시간이 이미 지난 이벤트(과거)는 반환하지 않는다', () => {
    const result = getUpcomingEvents(dummyEvents.events as Event[], new Date(), []);
    expect(result.find((event) => event.id === 'NOTIF003')).toBeUndefined();
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = dummyEvents.events[0] as Event;
    const result = createNotificationMessage(event);
    expect(result).toBe(`${event.notificationTime}분 후 ${event.title} 일정이 시작됩니다.`);
  });
});
