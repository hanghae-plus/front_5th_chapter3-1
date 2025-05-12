import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '12:00',
    description: '첫 번째 이벤트',
    location: '장소 1',
    category: '카테고리 1',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 15,
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2025-07-05',
    startTime: '14:00',
    endTime: '16:00',
    description: '두 번째 이벤트',
    location: '장소 2',
    category: '카테고리 2',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 15,
  },
  {
    id: '3',
    title: '이벤트 3',
    date: '2025-07-10',
    startTime: '09:00',
    endTime: '11:00',
    description: '세 번째 이벤트',
    location: '장소 3',
    category: '카테고리 3',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 15,
  },
];

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트 2', new Date('2025-07-01'), 'month');
    expect(result).toEqual([mockEvents[1]]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'week');
    expect(result).toEqual([mockEvents[0], mockEvents[1]]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'month');
    expect(result).toEqual(mockEvents);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트', new Date('2025-07-01'), 'week');
    expect(result).toEqual([mockEvents[0], mockEvents[1]]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'month');
    expect(result).toEqual(mockEvents);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(mockEvents, '이벤트 2', new Date('2025-07-01'), 'month');
    expect(result).toEqual([mockEvents[1]]);
    const resultUpperCase = getFilteredEvents(mockEvents, '이벤트 2'.toUpperCase(), new Date('2025-07-01'), 'month');
    expect(resultUpperCase).toEqual([mockEvents[1]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const boundaryEvent: Event = {
      id: '4',
      title: '월 경계 이벤트',
      date: '2025-06-30',
      startTime: '10:00',
      endTime: '12:00',
      description: '6월 마지막 날 이벤트',
      location: '장소 4',
      category: '카테고리 4',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    };
    const result = getFilteredEvents([boundaryEvent, ...mockEvents], '', new Date('2025-07-01'), 'month');
    expect(result).toEqual(mockEvents); // 6월 30일은 7월 뷰에 포함되지 않음
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2025-07-01'), 'month');
    expect(result).toEqual([]);
  });
});
