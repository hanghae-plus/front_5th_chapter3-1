import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

const events: Event[] = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2025-07-01',
    startTime: '14:30',
    endTime: '15:30',
    description: '이벤트 1 설명',
    location: '이벤트 1 위치',
    category: '이벤트 1 카테고리',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 0,
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2025-07-02',
    startTime: '14:30',
    endTime: '15:30',
    description: '이벤트 2 설명',
    location: '이벤트 2 위치',
    category: '이벤트 2 카테고리',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 0,
  },
  {
    id: '3',
    title: '이벤트 3',
    date: '2025-07-03',
    startTime: '14:30',
    endTime: '15:30',
    description: '이벤트 3 설명',
    location: '이벤트 3 위치',
    category: '이벤트 3 카테고리',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 0,
  },
];

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    // events: Event[],searchTerm: string, currentDate: Date,view: 'week' | 'month'
    const searchTerm = '이벤트 2';
    const currentDate = new Date('2025-07-01');
    const view = 'week';
    const result = getFilteredEvents(events, searchTerm, currentDate, view);
    const filteredEvents = events.filter((event) => event.title.includes(searchTerm));
    expect(result).toEqual(filteredEvents);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const searchTerm = '';
    const currentDate = new Date('2025-07-01');
    const view = 'week';

    const result = getFilteredEvents(events, searchTerm, currentDate, view);
    const filteredEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === 2025 && eventDate.getMonth() === 6;
    });
    expect(result).toEqual(filteredEvents);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const searchTerm = '';
    const currentDate = new Date('2025-07-01');
    const view = 'month';

    const result = getFilteredEvents(events, searchTerm, currentDate, view);
    const filteredEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === 2025 && eventDate.getMonth() === 6;
    });
    expect(result).toEqual(filteredEvents);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const searchTerm = '이벤트 1';
    const currentDate = new Date('2025-07-01');

    const result = getFilteredEvents(events, searchTerm, currentDate, 'week');
    const filteredEvents = events.filter(
      (event) => event.title.includes(searchTerm) && event.date.includes('2025-07-01')
    );
    expect(result).toEqual(filteredEvents);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const searchTerm = '';
    const currentDate = new Date('2025-07-01');
    const view = 'week';

    const result = getFilteredEvents(events, searchTerm, currentDate, view);
    expect(result).toEqual(events);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: 'event 1',
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30',
        description: '이벤트 1 설명',
        location: '이벤트 1 위치',
        category: '이벤트 1 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
    ];

    const searchTerm = 'Event 1';
    const currentDate = new Date('2025-07-01');
    const view = 'week';

    const result = getFilteredEvents(events, searchTerm, currentDate, view);
    expect(result).toEqual([events[0]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    // 월의 경계에 있는 이벤트
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30',
        description: '이벤트 1 설명',
        location: '이벤트 1 위치',
        category: '이벤트 1 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
    ];

    const searchTerm = '';
    const currentDate = new Date('2025-07-01');
    const view = 'month';

    const result = getFilteredEvents(events, searchTerm, currentDate, view);
    expect(result).toEqual([events[0]]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events: Event[] = [];
    const searchTerm = '';
    const currentDate = new Date('2025-07-01');
    const view = 'week';

    const result = getFilteredEvents(events, searchTerm, currentDate, view);
    expect(result).toEqual([]);
  });
});
