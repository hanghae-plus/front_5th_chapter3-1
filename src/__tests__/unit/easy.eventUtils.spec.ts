import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '카테고리 1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
        category: '카테고리 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const filteredEvents = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'week');

    expect(filteredEvents).toEqual([events[1]]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const julyFirstEvent: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 1 설명',
      location: '이벤트 1 장소',
      category: '카테고리 1',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const julySecondEvent: Event = {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-01',
      startTime: '11:00',
      endTime: '12:00',
      description: '이벤트 2 설명',
      location: '이벤트 2 장소',
      category: '카테고리 2',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const julyLastEvent: Event = {
      id: '3',
      title: '이벤트 3',
      date: '2025-07-31',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 3 설명',
      location: '이벤트 3 장소',
      category: '카테고리 3',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const events: Event[] = [julyFirstEvent, julySecondEvent, julyLastEvent];
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');

    expect(filteredEvents).toEqual([julyFirstEvent, julySecondEvent]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const julyFirstEvent: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 1 설명',
      location: '이벤트 1 장소',
      category: '카테고리 1',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const julyLastEvent: Event = {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-31',
      startTime: '11:00',
      endTime: '12:00',
      description: '이벤트 2 설명',
      location: '이벤트 2 장소',
      category: '카테고리 2',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const augustFirstEvent: Event = {
      id: '3',
      title: '이벤트 3',
      date: '2025-08-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 3 설명',
      location: '이벤트 3 장소',
      category: '카테고리 3',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const events: Event[] = [julyFirstEvent, julyLastEvent, augustFirstEvent];
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(filteredEvents).toEqual([julyFirstEvent, julyLastEvent]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const julyFirstEvent: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 1 설명',
      location: '이벤트 1 장소',
      category: '카테고리 1',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const julyLastEvent: Event = {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-31',
      startTime: '11:00',
      endTime: '12:00',
      description: '이벤트 2 설명',
      location: '이벤트 2 장소',
      category: '카테고리 2',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const anotherEvent: Event = {
      id: '3',
      title: '특별',
      date: '2025-07-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '특별 설명',
      location: '특별 장소',
      category: '특별 카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const events: Event[] = [julyFirstEvent, julyLastEvent, anotherEvent];
    const filteredEvents = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');

    expect(filteredEvents).toEqual([julyFirstEvent]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '카테고리 1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
        category: '카테고리 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');

    expect(filteredEvents).toEqual(events);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: 'EVENT 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '카테고리 1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: 'event 2',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
        category: '카테고리 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '3',
        title: 'Event 3',
        date: '2025-07-01',
        startTime: '12:00',
        endTime: '13:00',
        description: '이벤트 3 설명',
        location: '이벤트 3 장소',
        category: '카테고리 3',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const filteredEvents = getFilteredEvents(events, 'event', new Date('2025-07-01'), 'week');

    expect(filteredEvents).toEqual(events);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const juneLastEvent: Event = {
      id: '1',
      title: '6월 마지막 이벤트',
      date: '2025-06-30',
      startTime: '10:00',
      endTime: '11:00',
      description: '6월 마지막 이벤트 설명',
      location: '6월 마지막 이벤트 장소',
      category: '카테고리 1',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const julyFirstEvent: Event = {
      id: '2',
      title: '7월 첫 이벤트',
      date: '2025-07-01',
      startTime: '11:00',
      endTime: '12:00',
      description: '7월 첫 이벤트 설명',
      location: '7월 첫 이벤트 장소',
      category: '카테고리 2',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const julyLastEvent: Event = {
      id: '3',
      title: '7월 마지막 이벤트',
      date: '2025-07-31',
      startTime: '10:00',
      endTime: '11:00',
      description: '7월 마지막 이벤트 설명',
      location: '7월 마지막 이벤트 장소',
      category: '카테고리 3',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const augustFirstEvent: Event = {
      id: '4',
      title: '8월 첫 이벤트',
      date: '2025-08-01',
      startTime: '11:00',
      endTime: '12:00',
      description: '8월 첫 이벤트 설명',
      location: '8월 첫 이벤트 장소',
      category: '카테고리 4',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const events: Event[] = [juneLastEvent, julyFirstEvent, julyLastEvent, augustFirstEvent];
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(filteredEvents).toEqual([julyFirstEvent, julyLastEvent]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events: Event[] = [];
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');

    expect(filteredEvents).toEqual([]);
  });
});
