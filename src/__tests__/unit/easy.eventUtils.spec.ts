import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

// 총 8개
const events: Event[] = [
  {
    id: '1',
    title: 'pasta',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '저녁밥',
    location: '회사',
    category: '저녁',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 15,
  },
  {
    id: '2',
    title: '피자',
    date: '2025-07-04',
    startTime: '22:00',
    endTime: '23:00',
    description: '과제하다 힘들어서',
    location: '집',
    category: '야식',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 30,
  },
  {
    id: '3',
    title: 'Pasta',
    date: '2025-07-08',
    startTime: '09:00',
    endTime: '10:00',
    description: '음,,',
    location: '회사',
    category: '아침',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 15,
  },
  {
    id: '4',
    title: '된장찌개',
    date: '2025-07-15',
    startTime: '11:00',
    endTime: '12:00',
    description: '세번째 주 화요일',
    location: '카페',
    category: '식사',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '5',
    title: '돼지껍데기',
    date: '2025-07-30',
    startTime: '16:00',
    endTime: '17:00',
    description: '맛있겠다',
    location: '고깃집',
    category: '식사',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 60,
  },
  {
    id: '6',
    title: '김치찌개',
    date: '2025-07-10',
    startTime: '13:00',
    endTime: '14:00',
    description: '고기듬뿎',
    location: '백채김치찌개',
    category: '식사',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 5,
  },
  {
    id: '7',
    title: '감자탕',
    date: '2025-06-30',
    startTime: '10:00',
    endTime: '11:00',
    description: '6월 마지막 날은 감자탕과 함께',
    location: '회사',
    category: '식사',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 15,
  },
  {
    id: '8',
    title: '타코',
    date: '2025-08-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '8월 첫 날',
    location: '올디스타코',
    category: '식사',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 15,
  },
];
const date1 = new Date('2025-07-01');
const date2 = new Date('2025-07-15');

describe('getFilteredEvents', () => {
  it("검색어 '피자'에 맞는 이벤트만 반환한다", () => {
    const filtered = getFilteredEvents(events, '피자', date1, undefined as any);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const filtered = getFilteredEvents(events, '', date1, 'week');
    expect(filtered).toHaveLength(3);
    expect(filtered.map((e) => e.id).sort()).toEqual(['1', '2', '7']);
  });

  // TODO: id 5번이 포함이 안됨
  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const filtered = getFilteredEvents(events, '', date2, 'month');
    expect(filtered).toHaveLength(6);
    expect(filtered.map((e) => e.id).sort()).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it("검색어 '찌개'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const filtered = getFilteredEvents(events, '찌개', date2, 'week');
    expect(filtered).toHaveLength(1);
    expect(filtered.map((e) => e.id).sort()).toEqual(['4']);
    expect(
      filtered.every(
        (e) =>
          e.title.toLowerCase().includes('찌개') ||
          e.description.toLowerCase().includes('찌개') ||
          e.location.toLowerCase().includes('찌개')
      )
    ).toBe(true);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const filtered = getFilteredEvents(events, '', date2, 'month');
    expect(filtered).toHaveLength(6);
    expect(filtered.map((e) => e.id).sort()).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const filtered = getFilteredEvents(events, 'pasta', date2, 'month');
    expect(filtered.map((e) => e.id).sort()).toEqual(['1', '3']);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const filtered = getFilteredEvents(events, '', date2, 'month');
    expect(filtered.some((e) => e.id === '1')).toBe(true);
    expect(filtered.some((e) => e.id === '7')).toBe(false);
    expect(filtered.some((e) => e.id === '8')).toBe(false);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const filteredWeek = getFilteredEvents([], '검색어', date1, 'week');
    const filteredMonth = getFilteredEvents([], '', date1, 'month');
    const filteredSearch = getFilteredEvents([], 'test', date1, undefined as any);

    expect(filteredWeek).toEqual([]);
    expect(filteredMonth).toEqual([]);
    expect(filteredSearch).toEqual([]);
  });
});
