import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-07-02',
      startTime: '16:00',
      endTime: '17:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const searchTerm = '이벤트 2';
    const currentDate = new Date('2025-07-15');
    const view = 'month';
    const filteredEvents = getFilteredEvents(events, searchTerm, currentDate, view);
    expect(filteredEvents.length).toBe(1);
    expect(filteredEvents[0].id).toBe('2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const searchTerm = '';
    const currentDate = new Date('2025-07-01');
    const view = 'week';
    const filteredEvents = getFilteredEvents(events, searchTerm, currentDate, view);
    expect(filteredEvents.length).toBe(2);
    expect(filteredEvents.map((e) => e.id).sort()).toEqual(['1', '3']);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const searchTerm = '';
    const currentDate = new Date('2025-07-15');
    const view = 'month';
    const filteredEvents = getFilteredEvents(events, searchTerm, currentDate, view);
    expect(filteredEvents.length).toBe(3);
    expect(filteredEvents.map((e) => e.id).sort()).toEqual(['1', '2', '3']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const searchTerm = '이벤트';
    const currentDate = new Date('2025-07-01');
    const view = 'week';
    const filteredEvents = getFilteredEvents(events, searchTerm, currentDate, view);
    expect(filteredEvents.length).toBe(2);
    expect(filteredEvents.map((e) => e.id).sort()).toEqual(['1', '3']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const searchTerm = '';
    const currentDate = new Date('2025-07-01');
    const view = 'week';
    const filteredEvents = getFilteredEvents(events, searchTerm, currentDate, view);
    expect(filteredEvents.length).toBe(2);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const searchTerm = '이벤트 2';
    const currentDate = new Date('2025-07-15');
    const view = 'month';

    const filteredEvents = getFilteredEvents(events, searchTerm, currentDate, view);
    const uppercaseFilteredEvents = getFilteredEvents(
      events,
      searchTerm.toUpperCase(),
      currentDate,
      view
    );

    expect(filteredEvents.length).toBe(1);
    expect(uppercaseFilteredEvents.length).toBe(1);
    expect(filteredEvents[0].id).toBe('2');
    expect(uppercaseFilteredEvents[0].id).toBe('2');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const searchTerm = '';
    const currentDate = new Date('2025-06-30');
    const view = 'week';

    const filteredEvents = getFilteredEvents(events, searchTerm, currentDate, view);

    expect(filteredEvents.length).toBe(2);
    expect(filteredEvents.some((e) => e.date === '2025-07-01')).toBe(true);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const emptyEvents: Event[] = [];
    const searchTerm = '이벤트';
    const currentDate = new Date('2025-07-01');
    const view = 'week';

    const filteredEvents = getFilteredEvents(emptyEvents, searchTerm, currentDate, view);

    expect(filteredEvents).toEqual([]);
    expect(filteredEvents.length).toBe(0);
  });
});
