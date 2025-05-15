import {Event} from '../../types';
import {createNotificationMessage, getUpcomingEvents} from '../../utils/notificationUtils';
import {expect} from "vitest";

const event1: Event = {
  "id": "1",
  "title": "event1",
  "date": "2025-07-02",
  "startTime": "09:00",
  "endTime": "12:00",
  "description": "이벤트 1",
  "location": "회의실 B",
  "category": "업무",
  "repeat": {"type": "none", "interval": 0},
  "notificationTime": 10
}
const event2: Event = {
  "id": "2",
  "title": "event2",
  "date": "2025-07-15",
  "startTime": "14:00",
  "endTime": "16:00",
  "description": "이벤트 2",
  "location": "회의실 B",
  "category": "업무",
  "repeat": {"type": "none", "interval": 0},
  "notificationTime": 10
}
const event3: Event = {
  "id": "2",
  "title": "event3",
  "date": "2025-07-31",
  "startTime": "14:00",
  "endTime": "16:00",
  "description": "이벤트 3",
  "location": "회의실 B",
  "category": "업무",
  "repeat": {"type": "none", "interval": 0},
  "notificationTime": 10
}

const events = [event1, event2, event3]

describe('getUpcomingEvents', () => {
  const notifiedEvents: string[] = [];
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    expect(getUpcomingEvents(events, new Date('2025-07-15T13:55'), notifiedEvents)).toEqual([event2])
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    notifiedEvents.push('2');
    expect(getUpcomingEvents(events, new Date('2025-07-15T13:55'), notifiedEvents)).toEqual([])
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(events, new Date('2025-07-31T14:00'), notifiedEvents)).toEqual([])
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(events, new Date('2025-07-15T13:55'), notifiedEvents)).toEqual([])
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    expect(createNotificationMessage(event1)).toBe('10분 후 event1 일정이 시작됩니다.')
  });
});
