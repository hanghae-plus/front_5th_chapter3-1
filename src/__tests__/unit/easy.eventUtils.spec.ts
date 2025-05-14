import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      description: '첫번째 이벤트',
      location: '서울',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '이벤트 2',
      description: '두번째 이벤트',
      location: '부산',
      date: '2025-07-02',
      startTime: '12:00',
      endTime: '13:00',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '3',
      title: 'Other Event',
      description: '이벤트 3',
      location: '대구',
      date: '2025-07-08',
      startTime: '14:00',
      endTime: '15:00',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '4',
      title: '이벤트 4',
      description: '네번째',
      location: '인천',
      date: '2025-06-30',
      startTime: '16:00',
      endTime: '17:00',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '5',
      title: 'Event 5',
      description: '다섯번째 이벤트',
      location: '부산',
      date: '2025-08-01',
      startTime: '10:00',
      endTime: '11:00',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '6',
      title: '이벤트 말일',
      description: '',
      location: '',
      date: '2025-07-31',
      startTime: '09:00',
      endTime: '10:00',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'month');
    expect(result).toEqual([expect.objectContaining({ id: '2', title: '이벤트 2' })]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    // 원본 순서에서 필터링: id 1, 2, 4
    expect(result.map((e) => e.id)).toEqual(['1', '2', '4']);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(result.map((e) => e.id)).toEqual(['1', '2', '3', '6']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');
    // 검색어 '이벤트'에 매칭되는 id 1,2,3,5 중 주간 범위(6/29~7/5)에 든 id 1,2
    expect(result.map((e) => e.id)).toEqual(['1', '2', '4']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const weekResult = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    expect(weekResult.map((e) => e.id)).toEqual(['1', '2', '4']);

    const monthResult = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(monthResult.map((e) => e.id)).toEqual(['1', '2', '3', '6']);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(events, 'event', new Date('2025-08-01'), 'month');
    expect(result.map((e) => e.id)).toEqual(['5']);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-15'), 'month');
    // 7월 1일~7월 31일만 포함: id '1' and '6'
    expect(result.map((e) => e.id).sort()).toEqual(['1', '2', '3', '6']);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '이벤트', new Date('2025-07-01'), 'week');
    expect(result).toEqual([]);
  });
});
