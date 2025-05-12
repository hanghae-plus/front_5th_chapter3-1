  import { Event } from '../../types';
  import { getFilteredEvents } from '../../utils/eventUtils';
  import dummyEvents from '../dummy/dummyFilterEvents.json' assert { type: 'json' };

  describe('getFilteredEvents', () => {

    it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
      const result = getFilteredEvents(dummyEvents.events as Event[], '이벤트 2', new Date('2025-07-01'), 'week');
      expect(result).toEqual(dummyEvents.events.filter((event) => event.title.includes('이벤트 2')));
    });

    it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(dummyEvents.events as Event[], '', new Date('2025-07-01'), 'week');
    const expectedIds = ['FILTER001', 'FILTER002', 'FILTER003', 'FILTER008'];
    const expectedEvents = dummyEvents.events.filter((e) => expectedIds.includes(e.id));
    expect(result).toEqual(expectedEvents);
    });

    it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
      const result = getFilteredEvents(dummyEvents.events as Event[], '', new Date('2025-07-01'), 'month');
      const expectedIds = ['FILTER001', 'FILTER002', 'FILTER003', 'FILTER004', 'FILTER007', 'FILTER008', 'FILTER009', 'FILTER010'];
      const expectedEvents = dummyEvents.events.filter((e) => expectedIds.includes(e.id));
      expect(result).toEqual(expectedEvents);
    });

    it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
      const result = getFilteredEvents(dummyEvents.events as Event[], '이벤트', new Date('2025-07-01'), 'week');
      const expectedIds = ['FILTER001', 'FILTER002', 'FILTER003', 'FILTER008'];
      const expectedEvents = dummyEvents.events.filter((e) => expectedIds.includes(e.id));
      const eventsWithKeyword = dummyEvents.events.filter((event) => 
        Object.values(event).some((value) => 
          typeof value === 'string' && value.includes('이벤트')
        )
      );
      expect(result).toEqual(eventsWithKeyword && expectedEvents);
    });

    it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
      const result = getFilteredEvents(dummyEvents.events as Event[], '', new Date('2025-07-01'), 'week');
      const expectedIds = ['FILTER001', 'FILTER002', 'FILTER003', 'FILTER008'];
      const expectedEvents = dummyEvents.events.filter((e) => expectedIds.includes(e.id));
      expect(result).toEqual(expectedEvents);
    });


  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(dummyEvents.events as Event[], 'EVENT', new Date('2025-07-01'), 'month');
    const expectedIds = ['FILTER007'];
    const expectedEvents = dummyEvents.events.filter((e) => expectedIds.includes(e.id));
    expect(result).toEqual(expectedEvents);
});

    it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
      const result = getFilteredEvents(dummyEvents.events as Event[], '', new Date('2025-07-01'), 'month');
      expect(result).toEqual(dummyEvents.events.filter((event) => event.date.includes('2025-07')));
    });

    it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
      const result = getFilteredEvents([] as Event[], '', new Date('2025-07-01'), 'week');
      expect(result).toEqual([]);
    });
  });
