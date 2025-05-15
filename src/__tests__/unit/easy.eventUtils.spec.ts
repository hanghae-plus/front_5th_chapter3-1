import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

const events: Event[] = [
  {
    id: '1',
    date: '2025-07-01',
    startTime: '14:30',
    endTime: '15:30',
    title: '이벤트 1',
    description: 'test',
    location: 'test',
    category: 'test',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  },
  {
    id: '2',
    date: '2025-07-01',
    startTime: '15:30',
    endTime: '16:30',
    title: '이벤트 2',
    description: 'test',
    location: 'test',
    category: 'test',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  },
  {
    id: '3',
    date: '2025-07-01',
    startTime: '16:30',
    endTime: '17:30',
    title: '이벤트 3',
    description: 'test',
    location: 'test',
    category: 'test',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  },
  {
    id: '4',
    date: '2025-07-15',
    startTime: '17:30',
    endTime: '18:30',
    title: '이벤트 4',
    description: 'test',
    location: 'test',
    category: 'test',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  },
  {
    id: '5',
    date: '2025-07-15',
    startTime: '18:30',
    endTime: '19:30',
    title: 'Event 5',
    description: 'test',
    location: 'test',
    category: 'test',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  },
  {
    id: '6',
    date: '2025-07-15',
    startTime: '19:30',
    endTime: '20:30',
    title: 'event 6',
    description: 'test',
    location: 'test',
    category: 'test',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  },
];

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'month');
    expect(result).toEqual([events[1]]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    expect(result).toEqual([events[0], events[1], events[2]]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(result).toEqual([...events]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');
    expect(result).toEqual([events[0], events[1], events[2]]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(result).toEqual([...events]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(events, 'event', new Date('2025-07-01'), 'month');
    expect(result).toEqual([events[4], events[5]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(result).toEqual([...events]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2025-07-01'), 'month');
    expect(result).toEqual([]);
  });
});
