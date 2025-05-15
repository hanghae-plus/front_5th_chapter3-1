import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2025-06-30',
    startTime: '10:00',
    endTime: '11:00',
    description: '설명 1',
    location: '서울',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2025-07-01',
    startTime: '12:00',
    endTime: '13:00',
    description: '설명 2',
    location: '부산',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '이벤트 3',
    date: '2025-07-15',
    startTime: '14:00',
    endTime: '15:00',
    description: '설명 3',
    location: '대구',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '4',
    title: 'Meeting',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: 'Team sync',
    location: 'Zoom',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트 2', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'week');
    const titles = result.map((e) => e.title).sort();
    expect(titles).toEqual(['이벤트 1', '이벤트 2', 'Meeting'].sort());
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'month');
    const titles = result.map((e) => e.title).sort();
    expect(titles).toEqual(['이벤트 2', '이벤트 3', 'Meeting'].sort());
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트', new Date('2025-07-01'), 'week');
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('이벤트 1');
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'month');
    expect(result.map((e) => e.title).sort()).toEqual(['이벤트 2', '이벤트 3', 'Meeting'].sort());
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(mockEvents, 'meeting', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Meeting');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-06-01'), 'month');
    const titles = result.map((e) => e.title);
    expect(titles).toContain('이벤트 1');
    expect(titles).not.toContain('이벤트 2');
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2025-07-01'), 'month');
    expect(result).toEqual([]);
  });
});
