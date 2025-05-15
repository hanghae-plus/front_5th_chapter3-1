import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';
import { createTestEvent } from '../helpers/event';

describe('getFilteredEvents', () => {
  const events = [
    createTestEvent({
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      description: 'event 1',
      location: '회의실 A',
    }),
    createTestEvent({
      id: '2',
      title: '이벤트 2',
      date: '2025-07-03',
      description: 'event 2',
      location: '회의실 B',
    }),
    createTestEvent({
      id: '3',
      title: '이벤트 3',
      date: '2025-07-10',
      description: 'event 3',
      location: '회의실 C',
    }),
    createTestEvent({
      id: '4',
      title: '이벤트 4',
      date: '2025-07-03',
      description: 'event 4',
      location: '회의실 D',
    }),
    createTestEvent({
      id: '5',
      title: '이벤트 5',
      date: '2025-07-31',
      description: 'event 5',
      location: '회의실 C',
    }),
    createTestEvent({
      id: '6',
      title: '이벤트 6',
      date: '2025-08-02',
      description: 'event 6',
      location: '회의실 A',
    }),
    createTestEvent({
      id: '7',
      title: '이벤트 7',
      date: '2025-06-30',
      description: 'event 7',
      location: '회의실 B',
    }),
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const searchQuery = '이벤트 2';
    const date = new Date('2025-07-01');

    const result = getFilteredEvents(events, searchQuery, date, 'month');

    expect(result).toHaveLength(1);

    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: '2', title: '이벤트 2' })])
    );
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const searchQuery = '';
    const date = new Date('2025-07-01');

    const result = getFilteredEvents(events, searchQuery, date, 'week');

    expect(result).toHaveLength(4);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: '1', date: '2025-07-01' }),
        expect.objectContaining({ id: '2', date: '2025-07-03' }),
        expect.objectContaining({ id: '4', date: '2025-07-03' }),
        expect.objectContaining({ id: '7', date: '2025-06-30' }),
      ])
    );
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const searchQuery = '';
    const date = new Date('2025-07-15');

    const result = getFilteredEvents(events, searchQuery, date, 'month');

    expect(result).toHaveLength(5);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: '1', date: '2025-07-01' }),
        expect.objectContaining({ id: '2', date: '2025-07-03' }),
        expect.objectContaining({ id: '3', date: '2025-07-10' }),
        expect.objectContaining({ id: '4', date: '2025-07-03' }),
        expect.objectContaining({ id: '5', date: '2025-07-31' }),
      ])
    );
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const searchQuery = '이벤트';
    const date = new Date('2025-07-01');

    const result = getFilteredEvents(events, searchQuery, date, 'week');

    expect(result).toHaveLength(4);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: '1', date: '2025-07-01', title: '이벤트 1' }),
        expect.objectContaining({ id: '2', date: '2025-07-03', title: '이벤트 2' }),
        expect.objectContaining({ id: '4', date: '2025-07-03', title: '이벤트 4' }),
        expect.objectContaining({ id: '7', date: '2025-06-30', title: '이벤트 7' }),
      ])
    );
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const searchQuery = '';
    const date = new Date('2025-07-01');

    const result = getFilteredEvents(events, searchQuery, date, 'month');

    const julyEvents = events.filter((event) => event.date.includes('2025-07'));

    expect(result).toHaveLength(julyEvents.length);
    expect(result).toEqual(julyEvents);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const searchQuery = 'EVENT';
    const date = new Date('2025-08-01');

    const result = getFilteredEvents(events, searchQuery, date, 'month');

    expect(result).toHaveLength(1);
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: '6', description: 'event 6' })])
    );
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const searchQuery = '';
    const endOfJune = new Date('2025-06-30');

    const resultJune = getFilteredEvents(events, searchQuery, endOfJune, 'week');

    expect(resultJune).toHaveLength(4);
    expect(resultJune).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: '1', date: '2025-07-01' }),
        expect.objectContaining({ id: '2', date: '2025-07-03' }),
        expect.objectContaining({ id: '4', date: '2025-07-03' }),
        expect.objectContaining({ id: '7', date: '2025-06-30' }),
      ])
    );

    const endOfJuly = new Date('2025-07-31');

    const resultJuly = getFilteredEvents(events, searchQuery, endOfJuly, 'week');

    expect(resultJuly).toHaveLength(2);
    expect(resultJuly).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: '5', date: '2025-07-31' }),
        expect.objectContaining({ id: '6', date: '2025-08-02' }),
      ])
    );
  });
  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const emptyEvents: Event[] = [];
    const searchQuery = '';
    const date = new Date('2025-07-01');

    const result = getFilteredEvents(emptyEvents, searchQuery, date, 'month');

    expect(result).toEqual([]);
  });
});
