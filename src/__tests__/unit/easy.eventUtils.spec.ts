import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const events = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-05-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '첫 번째 이벤트',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-05-15',
        startTime: '11:00',
        endTime: '12:00',
        description: '두 번째 이벤트',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      }
    ];

    const currentDate = new Date('2025-05-15');
    const result = getFilteredEvents(events, '이벤트 2', currentDate, 'month');

    expect(result.length).toBe(1);
    expect(result[0].id).toBe('2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const events = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '7월 첫째 주 이벤트',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-10',
        startTime: '11:00',
        endTime: '12:00',
        description: '7월 둘째 주 이벤트',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      }
    ];

    const currentDate = new Date('2025-07-01');
    const result = getFilteredEvents(events, '', currentDate, 'week');

    expect(result.length).toBe(1);
    expect(result[0].id).toBe('1');
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const events = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '7월 이벤트',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-15',
        startTime: '11:00',
        endTime: '12:00',
        description: '7월 이벤트',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2025-08-01',
        startTime: '13:00',
        endTime: '14:00',
        description: '8월 이벤트',
        location: '회의실 C',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      }
    ];

    const currentDate = new Date('2025-07-15');
    const result = getFilteredEvents(events, '', currentDate, 'month');

    expect(result.length).toBe(2);
    expect(result.map(event => event.id)).toContain('1');
    expect(result.map(event => event.id)).toContain('2');
    expect(result.map(event => event.id)).not.toContain('3');
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const events = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-05-12',
        startTime: '09:00',
        endTime: '10:00',
        description: '첫 번째 이벤트',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      },
      {
        id: '2',
        title: '회의',
        date: '2025-05-13',
        startTime: '11:00',
        endTime: '12:00',
        description: '이벤트 관련 회의',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2025-05-20',
        startTime: '13:00',
        endTime: '14:00',
        description: '다른 주 이벤트',
        location: '회의실 C',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      }
    ];

    const currentDate = new Date('2025-05-15');
    const result = getFilteredEvents(events, '이벤트', currentDate, 'week');

    expect(result.length).toBe(1);
    expect(result[0].id).toBe('1');
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-05-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '첫 번째 이벤트',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-05-15',
        startTime: '11:00',
        endTime: '12:00',
        description: '두 번째 이벤트',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      }
    ];

    const currentDate = new Date('2025-05-15');
    const result = getFilteredEvents(events, '', currentDate, 'month');

    expect(result.length).toBe(2);
    expect(result.map(event => event.id)).toContain('1');
    expect(result.map(event => event.id)).toContain('2');
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events = [
      {
        id: '1',
        title: '이벤트 A',
        date: '2025-05-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '첫 번째 이벤트',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      },
      {
        id: '2',
        title: '이벤트 a',
        date: '2025-05-15',
        startTime: '11:00',
        endTime: '12:00',
        description: '두 번째 이벤트',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      }
    ];

    const currentDate = new Date('2025-05-15');
    const result = getFilteredEvents(events, 'a', currentDate, 'month');

    expect(result.length).toBe(2);
    expect(result.map(event => event.id)).toContain('1');
    expect(result.map(event => event.id)).toContain('2');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events = [
      {
        id: '1',
        title: '5월 마지막 이벤트',
        date: '2025-05-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '5월 마지막날 이벤트',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      },
      {
        id: '2',
        title: '6월 첫 이벤트',
        date: '2025-06-01',
        startTime: '11:00',
        endTime: '12:00',
        description: '6월 첫날 이벤트',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      }
    ];

    const mayDate = new Date('2025-05-30');
    const mayResult = getFilteredEvents(events, '', mayDate, 'month');

    expect(mayResult.length).toBe(1);
    expect(mayResult[0].id).toBe('1');

    const juneDate = new Date('2025-06-02');
    const juneResult = getFilteredEvents(events, '', juneDate, 'month');

    expect(juneResult.length).toBe(1);
    expect(juneResult[0].id).toBe('2');
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events = [];
    const currentDate = new Date('2025-05-15');
    const result = getFilteredEvents(events, '이벤트', currentDate, 'month');

    expect(result.length).toBe(0);
    expect(result).toEqual([]);
  });
});
