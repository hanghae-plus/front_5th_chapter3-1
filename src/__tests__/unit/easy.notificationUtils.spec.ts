import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

/**
 * @description getUpcomingEvents -> 주어진 이벤트에서 알림 시간이 도래한 이벤트를 반환합니다. (getUpcomingEvents)
 */
describe('주어진 이벤트에서 알림 시간이 도래한 이벤트를 반환합니다 (getUpcomingEvents)', () => {
  let events: Event[];

  beforeEach(() => {
    vi.useFakeTimers();

    events = [
      {
        id: '1',
        title: '이벤트 1',
        description: '이벤트 1 설명',
        location: '이벤트 1 위치',
        category: '이벤트 1 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
        date: '2025-05-12',
        startTime: '14:30',
        endTime: '15:30',
      },
    ];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const currentDate = new Date('2025-05-12T14:20:00');
    vi.setSystemTime(currentDate);

    const result = getUpcomingEvents(events, currentDate, []);

    expect(result).toEqual([events[0]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const currentDate = new Date('2025-05-12T14:20:00');
    vi.setSystemTime(currentDate);

    const result = getUpcomingEvents(events, currentDate, ['1']);

    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const currentDate = new Date('2025-05-12T14:00:00');
    vi.setSystemTime(currentDate);

    const result = getUpcomingEvents(events, currentDate, []);

    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const currentDate = new Date('2025-05-12T14:40:00');
    vi.setSystemTime(currentDate);

    const result = getUpcomingEvents(events, currentDate, []);

    expect(result).toEqual([]);
  });
});

/**
 * @description createNotificationMessage -> 주어진 이벤트에 대한 알림 메시지 텍스트를 반환합니다. (createNotificationMessage)
 */
describe('주어진 이벤트에 대한 알림 메시지 텍스트를 반환합니다. (createNotificationMessage)', () => {
  let events: Event[];

  beforeEach(() => {
    events = [
      {
        id: '1',
        title: '이벤트 1',
        description: '이벤트 1 설명',
        location: '이벤트 1 위치',
        category: '이벤트 1 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
        date: '2025-05-12',
        startTime: '14:30',
        endTime: '15:30',
      },
    ];
  });

  /**
   * @description 올바른 알림 메시지를 생성해야 한다 -> (알림시간)분 후 (이벤트 제목) 일정이 시작됩니다.
   */
  it('(알림시간)분 후 (이벤트 제목) 일정이 시작됩니다', () => {
    const result = createNotificationMessage(events[0]);

    expect(result).toBe('10분 후 이벤트 1 일정이 시작됩니다.');
  });
});
