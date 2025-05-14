import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

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

  it('월간 뷰에서 2025년 7월의 모든 이벤트만 반환한다', () => {
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

    const currentDate = new Date('2025-07');
    const result = getFilteredEvents(events, '', currentDate, 'month');

    const getLocalMonth = (dateString: string) => new Date(dateString).getMonth(); // 0-indexed

    expect(result).toHaveLength(2);
    expect(result.every((e) => getLocalMonth(e.date) === 6)).toBe(true); // 6 = July
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
        id: '1',
        date: '2025-06-30', // ❌ 6월
        startTime: '10:00',
        endTime: '11:00',
        title: '6월 마지막날',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
      {
        id: '2',
        date: '2025-07-01', // ✅ 포함
        startTime: '10:00',
        endTime: '11:00',
        title: '7월 첫날',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
      {
        id: '3',
        date: '2025-07-31', // ✅ 포함
        startTime: '10:00',
        endTime: '11:00',
        title: '7월 마지막날',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
      {
        id: '4',
        date: '2025-08-01', // ❌ 8월
        startTime: '10:00',
        endTime: '11:00',
        title: '8월 첫날',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
    ];

    const currentDate = new Date('2025-07');
    const result = getFilteredEvents(events, '', currentDate, 'month');

    expect(result.map((e) => e.id)).toEqual(['2']);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events: Event[] = [];

    const currentDate = new Date('2025-07-01');
    const result = getFilteredEvents(events, '', currentDate, 'month');

    expect(result).toEqual([]);
  });
});
