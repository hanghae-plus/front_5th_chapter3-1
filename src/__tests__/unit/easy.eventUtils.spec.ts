import { getFilteredEvents } from '../../utils/eventUtils';
import { makeEvents } from '../utils';

describe('getFilteredEvents', () => {
  const DEFAULT_DATE = new Date('2025-07-01T00:00:00Z');

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const events = makeEvents(24).map((event, index) => ({
      ...event,
      title: `이벤트 ${index + 1}`,
      date: DEFAULT_DATE.toISOString().split('T')[0],
    }));

    const filteredEvents = getFilteredEvents(events, '이벤트 2', DEFAULT_DATE, 'week');

    expect(filteredEvents).toStrictEqual(
      events.filter((event) => event.title.includes('이벤트 2'))
    );
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    // 2025-06-28 ~ 2025-07-07
    const events = makeEvents(10).map((event, index) => ({
      ...event,
      date: new Date(DEFAULT_DATE.getFullYear(), DEFAULT_DATE.getMonth(), index - 1, 9)
        .toISOString()
        .split('T')[0],
    }));

    const filteredEvents = getFilteredEvents(events, '', DEFAULT_DATE, 'week');

    // 2025-06-29(일) ~ 2025-07-05(토)
    expect(filteredEvents).toStrictEqual(events.slice(0, 7));
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    // 2025-06-28 ~ 2025-08-06
    const events = makeEvents(40).map((event, index) => ({
      ...event,
      date: new Date(DEFAULT_DATE.getFullYear(), DEFAULT_DATE.getMonth(), index - 1, 9)
        .toISOString()
        .split('T')[0],
    }));

    const filteredEvents = getFilteredEvents(events, '', DEFAULT_DATE, 'month');

    // 2025-07-01 ~ 2025-07-31
    expect(filteredEvents).toStrictEqual(events.slice(2, 33));
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const events = makeEvents(40).map((event, index) => ({
      ...event,
      title: `이벤트 ${index + 1}`,
      date: DEFAULT_DATE.toISOString().split('T')[0],
    }));

    const filteredEvents = getFilteredEvents(events, '이벤트', DEFAULT_DATE, 'week');

    expect(filteredEvents).toStrictEqual(events.filter((event) => event.title.includes('이벤트')));
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events = makeEvents(40).map((event, index) => ({
      ...event,
      title: `이벤트 ${index + 1}`,
      date: DEFAULT_DATE.toISOString().split('T')[0],
    }));

    const filteredEvents = getFilteredEvents(events, '이벤트', DEFAULT_DATE, 'month');

    expect(filteredEvents).toStrictEqual(events);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events = makeEvents(40).map((event, index) => ({
      ...event,
      title: index % 2 === 0 ? `EVENT ${index + 1}` : `event ${index + 1}`,
      date: DEFAULT_DATE.toISOString().split('T')[0],
    }));

    const filteredEvents = getFilteredEvents(events, 'EvEnT', DEFAULT_DATE, 'month');

    expect(filteredEvents).toStrictEqual(events);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    // [2025-07-01, 2025-07-02]
    const events = makeEvents(2).map((event, index) => ({
      ...event,
      title: `이벤트 ${index + 1}`,
      date: new Date(DEFAULT_DATE.getFullYear(), DEFAULT_DATE.getMonth(), index + 1, 9) // 한국 시간이랑 안맞아서 +9시간
        .toISOString()
        .split('T')[0],
    }));

    const filteredEvents = getFilteredEvents(events, '', DEFAULT_DATE, 'month');

    expect(filteredEvents).toStrictEqual(events.slice(0));
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events = makeEvents(0);
    const filteredEvents = getFilteredEvents(events, '', DEFAULT_DATE, 'week');

    expect(filteredEvents).toStrictEqual([]);
  });
});
