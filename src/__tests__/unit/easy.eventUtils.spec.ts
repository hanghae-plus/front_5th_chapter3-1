import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

// TODO: 다른 함수들도 테스트 해야할것 같음 일단 미루고 나중에
describe('getFilteredEvents', () => {
  let mockEvents: Event[];

  beforeEach(() => {
    mockEvents = [
      {
        id: '1',
        title: '이벤트 1',
        description: '이벤트 1 설명',
        location: '이벤트 1 위치',
        category: '이벤트 1 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
        date: '2025-05-12',
        startTime: '14:30',
        endTime: '15:30',
      },
      {
        id: '2',
        title: '이벤트 Korea2',
        description: '이벤트 2 설명',
        location: '이벤트 2 위치',
        category: '이벤트 2 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
        date: '2025-05-12',
        startTime: '16:00',
        endTime: '17:00',
      },
      {
        id: '3',
        title: '이벤트 3',
        description: '이벤트 3 설명',
        location: '이벤트 3 위치',
        category: '이벤트 3 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
        date: '2025-07-01',
        startTime: '12:00',
        endTime: '14:00',
      },
      {
        id: '4',
        title: '이벤트 4',
        description: '이벤트 4 설명',
        location: '이벤트 4 위치',
        category: '이벤트 4 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
        date: '2025-07-03',
        startTime: '12:00',
        endTime: '14:00',
      },
    ];
  });
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트 2', new Date(), 'month');

    expect(result).toEqual([mockEvents[1]]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'week');

    expect(result).toEqual([mockEvents[2], mockEvents[3]]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'month');

    expect(result).toEqual([mockEvents[2], mockEvents[3]]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트', new Date('2025-07-01'), 'week');

    expect(result).toEqual([mockEvents[2], mockEvents[3]]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'month');

    expect(result).toEqual([mockEvents[2], mockEvents[3]]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(mockEvents, '이벤트 korea2', new Date(), 'month');

    expect(result).toEqual([mockEvents[1]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-06-30'), 'month');

    expect(result).toEqual([]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date(), 'month');

    expect(result).toEqual([]);
  });
});
