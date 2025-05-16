import { Event, RepeatType } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { getFilteredEvents } from '../../utils/eventUtils';

function makeEvent(id: string, updatedProperty: Partial<Event> = {}): Event {
  const defaultEvent = {
    id: id,
    title: `이벤트 ${id}`,
    date: formatDate(new Date()),
    startTime: '10:00',
    endTime: '11:00',
    description: `이벤트 ${id} 설명`,
    location: `이벤트 ${id} 장소`,
    category: `이벤트 ${id} 카테고리`,
    repeat: {
      type: 'none' as RepeatType,
      interval: 0,
    },
    notificationTime: 0,
  };
  return { ...defaultEvent, ...updatedProperty };
}

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const currentDate = new Date();
    const event1 = makeEvent('1', { title: '이벤트 1', date: formatDate(currentDate) });

    // title이 일치하는 이벤트
    const event2 = makeEvent('2', { title: '이벤트 2', date: formatDate(currentDate) });

    const event3 = makeEvent('3', { title: '이벤트 3', date: formatDate(currentDate) });

    // location이 일치하는 이벤트
    const event4 = makeEvent('4', {
      title: '이벤트 4',
      location: '이벤트 2',
      date: formatDate(currentDate),
    });

    // description이 일치하는 이벤트
    const event5 = makeEvent('5', {
      title: '이벤트 5',
      description: '이벤트 2',
      date: formatDate(currentDate),
    });

    const events = [event1, event2, event3, event4, event5];
    expect(getFilteredEvents(events, '이벤트 2', new Date(), 'week')).toEqual([
      event2,
      event4,
      event5,
    ]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const event1 = makeEvent('1', { date: '2025-07-01' });
    const event2 = makeEvent('2', { date: '2025-07-02' });
    const event3 = makeEvent('3', { date: '2025-07-03' });
    const event4 = makeEvent('4', { date: '2025-06-01' });
    const event5 = makeEvent('5', { date: '2025-06-02' });

    const events = [event1, event2, event3, event4, event5];
    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'week')).toEqual([
      event1,
      event2,
      event3,
    ]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const event1 = makeEvent('1', { date: '2025-07-01' });
    const event2 = makeEvent('2', { date: '2025-07-02' });
    const event3 = makeEvent('3', { date: '2025-07-03' });
    const event4 = makeEvent('4', { date: '2025-06-01' });
    const event5 = makeEvent('5', { date: '2025-06-02' });
    const event6 = makeEvent('6', { date: '2025-07-23' });
    const event7 = makeEvent('7', { date: '2025-07-05' });

    const events = [event1, event2, event3, event4, event5, event6, event7];
    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'month')).toEqual([
      event1,
      event2,
      event3,
      event6,
      event7,
    ]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const event1 = makeEvent('1', { date: '2025-07-01' });
    const event2 = makeEvent('2', { date: '2025-07-02' });
    const event3 = makeEvent('3', { date: '2025-07-03' });
    const event4 = makeEvent('4', { date: '2025-06-01' });
    const event5 = makeEvent('5', { date: '2025-06-02' });

    const events = [event1, event2, event3, event4, event5];
    expect(getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week')).toEqual([
      event1,
      event2,
      event3,
    ]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const event1 = makeEvent('1', { date: '2025-07-01' });
    const event2 = makeEvent('2', { date: '2025-07-02' });
    const event3 = makeEvent('3', { date: '2025-07-03' });
    const event4 = makeEvent('4', { date: '2025-06-01' });
    const event5 = makeEvent('5', { date: '2025-06-02' });

    const events = [event1, event2, event3, event4, event5];
    expect(getFilteredEvents(events, '', new Date('2025-07-01'), '')).toEqual([
      event1,
      event2,
      event3,
      event4,
      event5,
    ]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const event1 = makeEvent('1', { date: '2025-07-01', title: 'event' });
    const event2 = makeEvent('2', { date: '2025-07-02', title: 'event' });
    const event3 = makeEvent('3', { date: '2025-07-03', title: 'event' });
    const event4 = makeEvent('4', { date: '2025-06-01', title: 'event' });
    const event5 = makeEvent('5', { date: '2025-06-02', title: 'event' });

    const events = [event1, event2, event3, event4, event5];
    expect(getFilteredEvents(events, 'Event', new Date('2025-07-01'), '')).toEqual([
      event1,
      event2,
      event3,
      event4,
      event5,
    ]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const event1 = makeEvent('1', { date: '2025-06-29' });
    const event2 = makeEvent('2', { date: '2025-06-30' });
    const event3 = makeEvent('3', { date: '2025-07-01' });
    const event4 = makeEvent('4', { date: '2025-07-02' });
    const event5 = makeEvent('5', { date: '2025-07-03' });

    const events = [event1, event2, event3, event4, event5];
    expect(getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'month')).toEqual([
      event3,
      event4,
      event5,
    ]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    expect(getFilteredEvents([], '이벤트', new Date('2025-07-01'), 'month')).toEqual([]);
  });
});
