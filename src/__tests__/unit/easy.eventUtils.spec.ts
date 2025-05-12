import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const common: Event = {
    id: '',
    title: '',
    date: '',
    startTime: '09:00',
    endTime: '18:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  } as const;
  // id, title, date 중점
  const events: Event[] = [
    { ...common, id: '1', title: '이벤트 1', date: '2025-07-01' },
    { ...common, id: '2', title: '이벤트 2', date: '2025-07-03' },
    { ...common, id: '3', title: '이벤트 3', date: '2025-07-08' },
    { ...common, id: '4', title: '이벤트 4', date: '2025-07-20' },
    { ...common, id: '5', title: '이벤트 5', date: '2025-07-25' },
    { ...common, id: '6', title: 'EVENT 6', date: '2025-07-30' },
  ];
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const filteredEvents = getFilteredEvents(events, '이벤트 2', new Date('2025-07-12'), 'month');
    expect(filteredEvents.length).toBe(1);
    expect(filteredEvents[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    expect(filteredEvents.length).toBe(2);
    expect(filteredEvents[0].title).toBe('이벤트 1');
    expect(filteredEvents[1].title).toBe('이벤트 2');
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(filteredEvents.length).toBe(6);
    expect(filteredEvents[0].title).toBe('이벤트 1');
    expect(filteredEvents[5].title).toBe('EVENT 6');
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const filteredEvents = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');
    expect(filteredEvents.length).toBe(2);
    expect(filteredEvents[0].title).toBe('이벤트 1');
    expect(filteredEvents[1].title).toBe('이벤트 2');
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(filteredEvents.length).toBe(6);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const filteredEvents = getFilteredEvents(events, 'eve', new Date('2025-07-01'), 'month');
    expect(filteredEvents.length).toBe(1);
    expect(filteredEvents[0].title).toBe('EVENT 6');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const prevEvent = { ...common, id: '0', title: '이벤트 0', date: '2025-06-30' };
    const nextEvent = { ...common, id: '7', title: '이벤트 7', date: '2025-08-01' };
    const dirtyEvents = [prevEvent, ...events, nextEvent];
    const filteredEvents = getFilteredEvents(dirtyEvents, '', new Date('2025-07-01'), 'month');
    expect(filteredEvents.length).toBe(6);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const filteredEvents = getFilteredEvents([], '', new Date('2025-07-01'), 'month');
    expect(filteredEvents.length).toBe(0);
  });
});

// 다른 월들 배열에 같이 넣어서 테스트 해도 함수의 기능을 검증하는데 문제는 없지 않을까?
{
  const common: Event = {
    id: '',
    title: '',
    date: '',
    startTime: '09:00',
    endTime: '18:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  } as const;
  // id, title, date 중점
  const events: Event[] = [
    { ...common, id: '1', title: '이벤트 1', date: '2025-05-12' },
    { ...common, id: '2', title: '이벤트 2', date: '2025-05-13' },
    { ...common, id: '3', title: '이벤트 3', date: '2025-07-03' }, // 다른 월은 해당 페이지에 보이지 않는다.
    { ...common, id: '4', title: '이벤트 4', date: '2025-07-20' }, //
    { ...common, id: '5', title: '이벤트 5', date: '2025-08-01' }, //
    { ...common, id: '6', title: 'EVENT 6', date: '2025-08-01' }, //
  ];
}
