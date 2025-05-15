import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

const events: Event[] = [
  {
    id: '1',
    title: '이벤트 1',
    description: '설명 1',
    location: '장소 1',
    date: '2025-07-01T10:00:00Z',
    startTime: '',
    endTime: '',
    category: '',
    repeat: {
      type: 'none',
      interval: 1,
      endDate: '2025-07-02',
    },
    notificationTime: 0,
  },
  {
    id: '2',
    title: '이벤트 2',
    description: '설명 2',
    location: '장소 2',
    date: '2025-07-02T10:00:00Z',
    startTime: '',
    endTime: '',
    category: '',
    repeat: {
      type: 'none',
      interval: 1,
      endDate: '2025-07-02',
    },
    notificationTime: 0,
  },
];

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'week');

    expect(result.map((e) => e.id)).toEqual(['2']);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2025-07-01'), 'week');
    expect(result).toEqual([]);
  });
});
