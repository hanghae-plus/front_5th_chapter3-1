import { getFilteredEvents } from '../../based/utils/eventUtils';
import { Event } from '../../types';

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    date: '2025-07-01',
    startTime: '14:30',
    endTime: '15:30',
    title: '이벤트 1',
    description: 'Event1 설명',
    location: '이벤트1 장소',
    category: '이벤트1 카테고리',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '2',
    date: '2025-07-02',
    startTime: '15:30',
    endTime: '16:30',
    title: '이벤트 2',
    description: 'Event2 설명',
    location: '이벤트2 장소',
    category: '이벤트2 카테고리',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
];

describe('getFilteredEvents', () => {
  it("월간 뷰에서 검색어 '이벤트 2'에 맞는 이벤트만 반환한다.", () => {
    const result = getFilteredEvents(MOCK_EVENTS, '이벤트 2', new Date('2025-07-02'), 'month');

    expect(result).toEqual([MOCK_EVENTS[1]]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다.', () => {
    const result = getFilteredEvents(MOCK_EVENTS, '', new Date('2025-07-01'), 'week');

    expect(result).toEqual(MOCK_EVENTS);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다.', () => {
    const result = getFilteredEvents(MOCK_EVENTS, '', new Date('2025-07-01'), 'month');

    expect(result).toEqual([MOCK_EVENTS[0], MOCK_EVENTS[1]]);
  });

  it("검색어 '이벤트'를 입력하고, 2025-07-01 주간 뷰에서 두 이벤트 모두 반환되는지 검증한다.", () => {
    const result = getFilteredEvents(MOCK_EVENTS, '이벤트', new Date('2025-07-01'), 'week');

    expect(result).toEqual(MOCK_EVENTS);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다.', () => {
    const result = getFilteredEvents(MOCK_EVENTS, '', new Date('2025-07-01'), 'week');

    expect(result).toEqual(MOCK_EVENTS);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다.', () => {
    const result = getFilteredEvents(MOCK_EVENTS, 'event', new Date('2025-07-01'), 'week');

    expect(result).toEqual(MOCK_EVENTS);
  });

  it('7월 31일에 등록된 이벤트가 7월 월간 뷰에서 정상적으로 노출된다.', () => {
    const result = getFilteredEvents(MOCK_EVENTS, '', new Date('2025-07-31'), 'month');

    expect(result).toEqual(MOCK_EVENTS);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다.', () => {
    const result = getFilteredEvents([], '', new Date('2025-07-01'), 'week');

    expect(result).toEqual([]);
  });

  it('검색어가 description에만 일치하면 해당 이벤트만 반환한다.', () => {
    const result = getFilteredEvents(MOCK_EVENTS, 'Event1 설명', new Date('2025-07-01'), 'month');
    expect(result).toEqual([MOCK_EVENTS[0]]);
  });

  it('검색어가 location에만 일치하면 해당 이벤트만 반환한다.', () => {
    const result = getFilteredEvents(MOCK_EVENTS, '이벤트2 장소', new Date('2025-07-02'), 'month');
    expect(result).toEqual([MOCK_EVENTS[1]]);
  });
});
