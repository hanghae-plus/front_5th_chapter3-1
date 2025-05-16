import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      description: '이벤트 1 설명',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      location: '회의실 A',
      category: '업무',
      notificationTime: 10,
      repeat: { type: 'none', interval: 0 },
    },
    {
      id: '2',
      title: '이벤트 2',
      description: '이벤트 2 설명',
      date: '2025-07-02',
      startTime: '10:00',
      endTime: '11:00',
      location: '회의실 A',
      category: '업무',
      notificationTime: 10,
      repeat: { type: 'none', interval: 0 },
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const searchTerm = '이벤트 2';
    const currentDate = new Date('2025-07-01');
    const view = 'month';
    expect(getFilteredEvents(events, searchTerm, currentDate, view)).toEqual([events[1]]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const searchTerm = '';
    const currentDate = new Date('2025-07-01');
    const view = 'week';
    expect(getFilteredEvents(events, searchTerm, currentDate, view)).toEqual(events);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const searchTerm = '';
    const currentDate = new Date('2025-07-15');
    const view = 'month';
    expect(getFilteredEvents(events, searchTerm, currentDate, view)).toEqual(events);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const searchTerm = '이벤트';
    const currentDate = new Date('2025-07-01');
    const view = 'week';
    expect(getFilteredEvents(events, searchTerm, currentDate, view)).toEqual(events);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const searchTerm = '';
    const currentDate = new Date('2025-07-01');
    const view = 'month';
    expect(getFilteredEvents(events, searchTerm, currentDate, view)).toEqual(events);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const searchTerm = '이벤트 2';
    const uppercaseSearchTerm = '이벤트 2';
    const currentDate = new Date('2025-07-01');
    const view = 'month';

    const result = getFilteredEvents(events, searchTerm, currentDate, view);
    const uppercaseResult = getFilteredEvents(events, uppercaseSearchTerm, currentDate, view);

    expect(result).toEqual(uppercaseResult);
    expect(result).toEqual([events[1]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const eventAtMonthBoundary: Event[] = [
      ...events,
      {
        id: '3',
        title: '이벤트 3',
        description: '이벤트 3 설명',
        date: '2025-07-31',
        startTime: '15:00',
        endTime: '16:00',
        location: '회의실 B',
        category: '회의',
        notificationTime: 15,
        repeat: { type: 'none', interval: 0 },
      },
    ];

    const searchTerm = '';
    const currentDate = new Date('2025-07-31');
    const view = 'month';

    expect(getFilteredEvents(eventAtMonthBoundary, searchTerm, currentDate, view)).toEqual(
      eventAtMonthBoundary
    );
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const emptyEvents: Event[] = [];
    const searchTerm = '';
    const currentDate = new Date('2025-07-01');
    const view = 'month';

    expect(getFilteredEvents(emptyEvents, searchTerm, currentDate, view)).toEqual([]);
  });
});
