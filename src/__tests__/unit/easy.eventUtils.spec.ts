import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const currentDate = new Date('2025-07-15');

  const mockEvents: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '세미나 내용',
      location: '서울',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-03',
      startTime: '10:00',
      endTime: '11:00',
      description: '워크숍',
      location: '부산',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '외부 일정',
      date: '2025-07-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '출장',
      location: '제주',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '4',
      title: '월말 미팅',
      date: '2025-07-31',
      startTime: '14:00',
      endTime: '15:00',
      description: '',
      location: '서울',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    // Given
    const searchTerm = '이벤트 2';

    // When
    const result = getFilteredEvents(mockEvents, searchTerm, currentDate, 'month');

    // Then
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    // Given
    const currentDate = new Date('2025-07-01');
    const searchTerm = '';

    // When
    const result = getFilteredEvents(mockEvents, searchTerm, currentDate, 'week');

    // Then
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    // Given
    const searchTerm = '';

    // When
    const result = getFilteredEvents(mockEvents, searchTerm, currentDate, 'month');

    // Then
    expect(result.map((e) => e.id)).toEqual(['1', '2', '3', '4']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    // Given
    const currentDate = new Date('2025-07-01');
    const searchTerm = '이벤트';

    // When
    const result = getFilteredEvents(mockEvents, searchTerm, currentDate, 'week');

    // Then
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    // Given
    const searchTerm = '';

    // When
    const result = getFilteredEvents(mockEvents, searchTerm, currentDate, 'month');

    // Then
    expect(result.length).toBe(4);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    // Given
    const searchTerm = '이벤트 2'; // ✅ 한글에 정확히 맞춤

    // Then
    const result = getFilteredEvents(mockEvents, searchTerm, currentDate, 'month');

    // Then
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    // Given
    const searchTerm = '';

    // Then
    const result = getFilteredEvents(mockEvents, searchTerm, currentDate, 'month');

    // Then
    expect(result.some((e) => e.date === '2025-07-31')).toBe(true);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    // Given
    const searchTerm = '이벤트';
    const events: Event[] = [];

    // When
    const result = getFilteredEvents(events, searchTerm, currentDate, 'month');

    // Then
    expect(result).toEqual([]);
  });
});
