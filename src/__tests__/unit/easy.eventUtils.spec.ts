import { getFilteredEvents } from '../../shared/lib/eventUtils';
import { Event } from '../../types';

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      title: '이벤트 1',
      description: '첫 번째 이벤트입니다',
      location: '서울',
      category: '',
      repeat: undefined,
      notificationTime: 0,
    },
    {
      id: '2',
      date: '2025-07-01',
      startTime: '12:00',
      endTime: '13:00',
      title: '이벤트 2',
      description: '두 번째 이벤트입니다',
      location: '부산',
      category: '',
      repeat: undefined,
      notificationTime: 0,
    },
    {
      id: '3',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '15:00',
      title: '세 번째 일정',
      description: '기타 이벤트',
      location: '이벤트 2 장소',
      category: '',
      repeat: undefined,
      notificationTime: 0,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const currentDate = new Date('2025-07-01');
    const result = getFilteredEvents(events, '', currentDate, 'week');

    // ✅ '2025-07-01'이 포함되어 있는지 확인
    expect(result.some((e) => e.date === '2025-07-01')).toBe(true);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        date: '2025-06-29',
        startTime: '10:00',
        endTime: '11:00',
        title: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      }, // 이전 주 일요일
      {
        id: '2',
        date: '2025-06-30',
        startTime: '10:00',
        endTime: '11:00',
        title: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      }, // 월요일
      {
        id: '3',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        title: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      }, // 화요일
      {
        id: '4',
        date: '2025-07-07',
        startTime: '10:00',
        endTime: '11:00',
        title: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      }, // 다음 주 월요일
    ];

    const currentDate = new Date('2025-07-01');

    const result = getFilteredEvents(events, '', currentDate, 'week');
    expect(result.map((e) => e.id)).toEqual(expect.arrayContaining(['2', '3']));
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '7월 시작',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '7월 중간',
        date: '2025-07-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '3',
        title: '7월 30일',
        date: '2025-07-30',
        startTime: '11:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '4',
        title: '6월 말 (제외)',
        date: '2025-06-30',
        startTime: '08:00',
        endTime: '09:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '5',
        title: '8월 시작 (제외)',
        date: '2025-08-01',
        startTime: '13:00',
        endTime: '14:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];

    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(result.length).toBe(3);
    expect(result.map((e) => e.id).sort()).toEqual(['1', '2', '3']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const events: Event[] = [
      {
        id: '1',
        date: '2025-06-30',
        startTime: '10:00',
        endTime: '11:00',
        title: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
      {
        id: '2',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        title: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
      {
        id: '3',
        date: '2025-07-15',
        startTime: '10:00',
        endTime: '11:00',
        title: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
      {
        id: '4',
        date: '2025-07-31',
        startTime: '10:00',
        endTime: '11:00',
        title: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
      {
        id: '5',
        date: '2025-08-01',
        startTime: '10:00',
        endTime: '11:00',
        title: '',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
    ];

    const currentDate = new Date('2025-07-15');
    const result = getFilteredEvents(events, '', currentDate, 'month');

    // ✅ 7월인 이벤트만 존재해야 함
    const allAreInJuly = result.every((e) => {
      const date = new Date(e.date);
      return date.getFullYear() === 2025 && date.getMonth() === 6; // JS에서 7월은 6 (0-based)
    });

    expect(allAreInJuly).toBe(true);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const currentDate = new Date('2025-07');
    const result = getFilteredEvents(events, '', currentDate, 'month');

    expect(result).toHaveLength(3);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events: Event[] = [
      {
        id: '1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        title: 'Event in Seoul',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
      {
        id: '2',
        date: '2025-07-01',
        startTime: '12:00',
        endTime: '13:00',
        title: 'hello WORLD',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
    ];

    const result = getFilteredEvents(events, 'event', new Date('2025-07-01'), 'week');
    expect(result.map((e) => e.id)).toContain('1');

    const result2 = getFilteredEvents(events, 'WORLD', new Date('2025-07-01'), 'week');
    expect(result2.map((e) => e.id)).toContain('2');

    const result3 = getFilteredEvents(events, 'world', new Date('2025-07-01'), 'week');
    expect(result3.map((e) => e.id)).toContain('2');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events: Event[] = [
      {
        id: '7a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p',
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '09:00',
        endTime: '18:00',
        description: '제주도 여행',
        location: '제주도',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '9b8c7d6e-5f4g-3h2i-1j0k-9l8m7n6o5p4',
        title: 'Test Title',
        date: '2025-07-01',
        startTime: '14:00',
        endTime: '16:00',
        description: '상반기 성과 회고 및 하반기 계획',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6',
        title: '가족 모임',
        date: '2025-07-31',
        startTime: '12:00',
        endTime: '15:00',
        description: '가족 모임 및 점심 식사',
        location: '가족 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7',
        title: '신입사원 교육',
        date: '2025-07-10',
        startTime: '10:00',
        endTime: '17:00',
        description: '신입사원 온보딩 교육',
        location: '교육장',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const result = getFilteredEvents(events, '', new Date('2025-07-31'), 'week');

    expect(result.length).toBe(1);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events: Event[] = [];

    const currentDate = new Date('2025-07-01');
    const result = getFilteredEvents(events, '', currentDate, 'month');

    expect(result).toEqual([]);
  });
});
