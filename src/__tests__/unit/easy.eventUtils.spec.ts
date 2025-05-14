import { getFilteredEvents } from '../../utils/eventUtils';
import type { Event } from '../../types';

describe('getFilteredEvents', () => {
  const makeUTCDate = (dateStr: string) => new Date(`${dateStr}T00:00:00Z`);

  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      description: '회의',
      location: '서울',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '이벤트 2',
      description: '워크숍',
      location: '부산',
      date: '2025-07-02',
      startTime: '14:00',
      endTime: '16:00',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
    {
      id: '3',
      title: '이벤트 3',
      description: '여행',
      location: '제주',
      date: '2025-08-01',
      startTime: '09:00',
      endTime: '18:00',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
  ];

  it('검색어가 정확히 일치하는 이벤트만 반환해야 한다', () => {
    const baseDate = makeUTCDate('2025-07-01');
    const result = getFilteredEvents(events, '이벤트 2', baseDate, 'month');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('주간 뷰에서 해당 주간(7월 1일 포함)의 이벤트만 필터링된다', () => {
    const baseDate = makeUTCDate('2025-07-01');
    const result = getFilteredEvents(events, '', baseDate, 'week');
    const dates = result.map((e) => e.date);
    expect(dates).toContain('2025-07-01');
    expect(dates).toContain('2025-07-02');
    expect(dates).not.toContain('2025-08-01');
  });

  it('월간 뷰에서 해당 월의 이벤트만 반환된다', () => {
    const baseDate = makeUTCDate('2025-07-01');
    const result = getFilteredEvents(events, '', baseDate, 'month');
    const dates = result.map((e) => e.date);
    expect(dates).toContain('2025-07-01');
    expect(dates).toContain('2025-07-02');
    expect(dates).not.toContain('2025-08-01');
  });

  it('검색어와 주간 뷰 필터링이 함께 적용되어야 한다', () => {
    const baseDate = makeUTCDate('2025-07-01');
    const result = getFilteredEvents(events, '이벤트', baseDate, 'week');
    const ids = result.map((e) => e.id);
    expect(ids).toEqual(expect.arrayContaining(['1', '2']));
    expect(ids).not.toContain('3');
  });

  it('검색어가 없으면 해당 월의 모든 이벤트가 반환된다', () => {
    const baseDate = makeUTCDate('2025-07-01');
    const result = getFilteredEvents(events, '', baseDate, 'month');
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('검색어는 대소문자를 구분하지 않고 일치해야 한다', () => {
    const baseDate = makeUTCDate('2025-07-01');
    const result = getFilteredEvents(events, '이벤트 2', baseDate, 'month'); // ✅ 한글 검색어
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('월 마지막 날 기준으로 다음 달 이벤트는 포함되지 않아야 한다', () => {
    const baseDate = makeUTCDate('2025-07-31');
    const result = getFilteredEvents(events, '', baseDate, 'month');
    expect(result.some((e) => e.date.startsWith('2025-08'))).toBe(false);
  });

  it('이벤트가 없을 경우 빈 배열을 반환해야 한다', () => {
    const baseDate = makeUTCDate('2025-07-01');
    const result = getFilteredEvents([], '검색어', baseDate, 'month');
    expect(result).toEqual([]);
  });
});
