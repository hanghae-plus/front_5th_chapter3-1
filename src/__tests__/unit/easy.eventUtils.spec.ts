import {Event} from '../../types';
import {getFilteredEvents} from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
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

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    // currentDate, view를 option으로 받거나 전체를 객체로 바꿨으면 좋겠다..
    expect(getFilteredEvents(events, '이벤트 2')).toEqual([event2])
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'week')).toEqual([event1])
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'month')).toEqual([event1, event2, event3])
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    expect(getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week')).toEqual([event1])
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(events, '')).toEqual([event1, event2, event3])
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    expect(getFilteredEvents(events, 'EVENT')).toEqual([event1, event2, event3])
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    expect(getFilteredEvents(events, 'EVENT', new Date('2025-07-01'), 'month')).toEqual([event1, event2, event3])
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    expect(getFilteredEvents([], 'EVENT')).toEqual([])
  });
});
