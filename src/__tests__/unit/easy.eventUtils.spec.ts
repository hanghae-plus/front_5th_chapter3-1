import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      category: '업무',
      date: '2025-05-20',
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '이벤트 1',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A"',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      category: '개인',
      date: '2025-05-20',
      id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
      title: '이벤트 2',
      startTime: '11:00',
      endTime: '12:30',
      description: '동료와 점심 식사',
      location: '회사 근처 식당"',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      category: '개인',
      date: '2025-07-01',
      id: '09702fb3-a478-40b3-905e-9ab3c8849dcdf',
      title: '이벤트 3',
      startTime: '12:30',
      endTime: '13:30',
      description: '지나가면서 신규에게 인사하기',
      location: '회사',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-05-20'), 'week');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
    expect(result[0].id).toBe('09702fb3-a478-40b3-905e-9ab3c8849dcd');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 3');
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 3');
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 3');
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-05-20'), 'month');
    expect(result).toHaveLength(2);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(events, 'Event one', new Date('2025-05-20'), 'week');
    expect(result).toHaveLength(0);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(1);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2025-07-01'), 'month');
    expect(result).toEqual([]);
  });
});
