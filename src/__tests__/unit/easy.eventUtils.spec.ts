import realEvents from '../../__mocks__/response/realEvents.json';
import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-07-01'));
});

afterAll(() => {
  vi.useRealTimers();
});

describe('getFilteredEvents', () => {
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

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date(), 'month');
    expect(result.length).toBe(1);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date(), 'week');
    expect(result.length).toBe(2);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date(), 'month');
    expect(result.length).toBe(4);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(events, '이벤트', new Date(), 'week');
    expect(result.length).toBe(1);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const weekResult = getFilteredEvents(events, '', new Date(), 'week');
    expect(weekResult.length).toBe(2);

    const monthResult = getFilteredEvents(events, '', new Date(), 'month');
    expect(monthResult.length).toBe(4);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(events, 'test title', new Date(), 'week');
    expect(result.length).toBe(1);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-31'), 'week');
    expect(result.length).toBe(1);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const weekResult = getFilteredEvents([], '', new Date(), 'week');
    expect(weekResult.length).toBe(0);

    const monthResult = getFilteredEvents([], '', new Date(), 'month');
    expect(monthResult.length).toBe(0);
  });
});
