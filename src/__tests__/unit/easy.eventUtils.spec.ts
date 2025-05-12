import { Event } from '../../types';
import events from '../../__mocks__/response/events.json';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'week');

    expect(result).toEqual([
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 2',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      }
    ])
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {});

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {});

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {});

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {});

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {});

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {});

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {});
});
