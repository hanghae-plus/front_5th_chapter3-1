import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      description: '첫 번째 event 설명',
      location: '회의실 A',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 30,
    },
    {
      id: '2',
      title: '이벤트 2',
      description: '두 번째 EVENT 설명',
      location: '회의실 B',
      date: '2025-07-03',
      startTime: '14:00',
      endTime: '15:00',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 15,
    },
    {
      id: '3',
      title: '이벤트 3',
      description: '6월 이벤트',
      location: '회의실 C',
      date: '2025-06-28',
      startTime: '16:00',
      endTime: '17:00',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 45,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const searchTerm = '이벤트 2';
    const currentDate = new Date('2025-07-15');
    const view = 'month';
    const filteredEvents = getFilteredEvents(mockEvents, searchTerm, currentDate, view);
    expect(filteredEvents.length).toBe(1);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const searchTerm = '';
    const currentDate = new Date('2025-07-01');
    const view = 'week';
    const filteredEvents = getFilteredEvents(mockEvents, searchTerm, currentDate, view);
    expect(filteredEvents.length).toBe(2);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const searchTerm = '';
    const currentDate = new Date('2025-07-01');
    const view = 'month';
    const filteredEvents = getFilteredEvents(mockEvents, searchTerm, currentDate, view);
    expect(filteredEvents.length).toBe(2);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const searchTerm = '이벤트';
    const currentDate = new Date('2025-07-01');
    const view = 'week';
    const filteredEvents = getFilteredEvents(mockEvents, searchTerm, currentDate, view);
    expect(filteredEvents.length).toBe(2);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const searchTerm = '';
    const currentDate = new Date('2025-07-01');
    const view = 'week';
    const filteredEvents = getFilteredEvents(mockEvents, searchTerm, currentDate, view);
    expect(filteredEvents.length).toBe(2);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    // 소문자 일때
    const lowerCaseSearch = 'event';
    const currentDate = new Date('2025-07-15');
    const view = 'month';
    const lowerCaseResults = getFilteredEvents(mockEvents, lowerCaseSearch, currentDate, view);
    console.log('lowerCaseResults:', lowerCaseResults);
    expect(lowerCaseResults.length).toBe(2);

    // 대문자 일때
    const upperCaseSearch = 'EVENT';
    const upperCaseResults = getFilteredEvents(mockEvents, upperCaseSearch, currentDate, view);
    expect(upperCaseResults.length).toBe(2);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const lastWeek = new Date('2025-06-28');
    const result = getFilteredEvents(mockEvents, '', lastWeek, 'week');
    expect(result.length).toBe(1);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const currentDate = new Date('2025-07-15');
    const result = getFilteredEvents([], '', currentDate, 'week');
    expect(result).toEqual([]);
  });
});
