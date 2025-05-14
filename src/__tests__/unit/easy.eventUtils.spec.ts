import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '일정1',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '일정1 설명',
    location: '집',
    category: '저녁',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '일정2',
    date: '2025-07-04',
    startTime: '10:00',
    endTime: '11:00',
    description: '일정2 설명',
    location: '집',
    category: '저녁',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '일정3',
    date: '2025-07-08',
    startTime: '10:00',
    endTime: '11:00',
    description: '일정3 설명',
    location: '집',
    category: '저녁',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '4',
    title: '일정4',
    date: '2025-07-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '일정4 설명',
    location: '집',
    category: '저녁',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '5',
    title: '일정5 sametitle',
    date: '2025-07-30',
    startTime: '10:00',
    endTime: '11:00',
    description: '일정5 설명',
    location: '집',
    category: '저녁',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '6',
    title: '일정6 SameTitle',
    date: '2025-07-10',
    startTime: '10:00',
    endTime: '11:00',
    description: '일정6 설명',
    location: '집',
    category: '저녁',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '7',
    title: 'same title',
    date: '2025-06-30',
    startTime: '10:00',
    endTime: '11:00',
    description: '일정7 설명',
    location: '집',
    category: '저녁',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '8',
    title: 'Same Title',
    date: '2025-08-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '일정8 설명',
    location: '집',
    category: '저녁',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
];

const mockDate1 = new Date('2025-07-01');
const mockDate2 = new Date('2025-07-15');

describe('getFilteredEvents', () => {
  it("검색어 '일정1'에 맞는 이벤트만 반환한다", () => {
    const filteredEvents = getFilteredEvents(mockEvents, '일정1', mockDate1, undefined as any);
    expect(filteredEvents.length).toBe(1);
    expect(filteredEvents[0].description).toBe('일정1 설명');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, '', mockDate1, 'week');
    expect(filteredEvents.length).toBe(3);

    const toBeId = ['1', '2', '7'];
    expect(filteredEvents.map((e) => e.id).sort()).toEqual(toBeId);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, '', mockDate2, 'month');
    expect(filteredEvents.length).toBe(6);

    const toBeId = ['1', '2', '3', '4', '5', '6'];
    expect(filteredEvents.map((e) => e.id).sort()).toEqual(toBeId);
  });

  it("검색어 '일정'과 주간 뷰 필터링을 동시에 적용한다", () => {
    const filteredEvents = getFilteredEvents(mockEvents, '일정', mockDate1, 'week');
    expect(filteredEvents.length).toBe(3);

    const toBeId = ['1', '2', '7'];
    expect(filteredEvents.map((e) => e.id).sort()).toEqual(toBeId);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, '', mockDate2, 'month');
    console.log(filteredEvents);
    expect(filteredEvents.length).toBe(6);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, 'sametitle', mockDate2, 'month');
    console.log(filteredEvents);
    expect(filteredEvents.length).toBe(2);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, '', mockDate2, 'month');
    const toBeId = ['1', '2', '3', '4', '5', '6'];
    expect(filteredEvents.map((e) => e.id).sort()).toEqual(toBeId);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const filteredEvents = getFilteredEvents([], '', mockDate2, 'month');
    expect(filteredEvents).toEqual([]);
  });
});
