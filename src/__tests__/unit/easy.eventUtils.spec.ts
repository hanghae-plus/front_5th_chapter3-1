import type { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-05-14',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '이벤트',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의2',
      date: '2025-06-30',
      startTime: '10:00',
      endTime: '15:00',
      description: '주간 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '주간 회의',
      date: '2025-07-01',
      startTime: '15:00',
      endTime: '17:00',
      description: '주간 팀 미팅',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: 'New Meeting',
      date: '2025-07-14',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '전체 회의',
      date: '2025-07-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];
  it("주간 뷰에서 검색어 '팀 회의'에 맞는 이벤트만 반환한다", () => {
    const filteredEvents = getFilteredEvents(events, '팀 회의', new Date('2025-05-12'), 'week');
    expect(filteredEvents).toEqual([
      expect.objectContaining({ title: '팀 회의', date: '2025-05-14' }),
    ]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    expect(filteredEvents).toEqual([
      expect.objectContaining({ date: '2025-06-30' }),
      expect.objectContaining({ date: '2025-07-01' }),
    ]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    console.log(filteredEvents);
    expect(filteredEvents).toEqual([
      expect.objectContaining({ date: '2025-07-01' }),
      expect.objectContaining({ date: '2025-07-14' }),
      expect.objectContaining({ date: '2025-07-20' }),
    ]);
  });

  // '주간 뷰에서 검색어 '팀 회의'에 맞는 이벤트만 반환한다'와 동일한 케이스라고 생각해서 skip 했습니다.
  it.skip("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {});

  // getFilteredEvents는 currentDate를 인자로 받기 때문에 모든 이벤트를 반환할 수 없습니다. 그래서 '특정 월의 이벤트를 반환한다'는 조건을 추가하려고 했습니다.
  // 하지만 이럴 경우 결국 위의 ‘월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다’와 동일한 케이스가 된다고 생각해서 skip 했습니다.
  it.skip('검색어가 없을 때 모든 이벤트를 반환한다', () => {});

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const filteredEvents = getFilteredEvents(
      events,
      'new meeting',
      new Date('2025-07-01'),
      'month'
    );
    expect(filteredEvents).toEqual([
      expect.objectContaining({ title: 'New Meeting', date: '2025-07-14' }),
    ]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-06-29'), 'week');
    expect(filteredEvents).toEqual([
      expect.objectContaining({ date: '2025-06-30' }),
      expect.objectContaining({ date: '2025-07-01' }),
    ]);
  });

  it('현재 날짜가 포함된 월에 이벤트가 없다면 빈 배열을 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-09-01'), 'month');
    expect(filteredEvents).toHaveLength(0);
  });
});
