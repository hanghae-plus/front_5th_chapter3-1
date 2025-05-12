import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';
import { MOCK_DATA } from '../mock';

// events: Event[],
// searchTerm: string,
// currentDate: Date,
// view: 'week' | 'month'

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    expect(getFilteredEvents(MOCK_DATA, '이벤트 2', new Date('2025-07-01'), 'week')).toEqual(
      MOCK_DATA.slice(-1)
    );
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    expect(getFilteredEvents(MOCK_DATA, '', new Date('2025-07-01'), 'week')).toEqual(
      MOCK_DATA.slice(-1)
    );
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(MOCK_DATA, '', new Date('2025-07-01'), 'month')).toEqual(
      MOCK_DATA.slice(-1)
    );
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    expect(getFilteredEvents(MOCK_DATA, '이벤트', new Date('2025-07-01'), 'week')).toEqual(
      MOCK_DATA.slice(-1)
    );
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(MOCK_DATA, '', new Date('2025-05-20'), 'week')).toEqual(
      MOCK_DATA.slice(0, 3)
    );
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    expect(getFilteredEvents(MOCK_DATA, 'TEAM', new Date('2025-05-20'), 'week')).toEqual([
      MOCK_DATA[0],
    ]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    expect(getFilteredEvents(MOCK_DATA, '', new Date('2025-05-20'), 'month')).toEqual([
      MOCK_DATA[0],
      MOCK_DATA[1],
      MOCK_DATA[2],
    ]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    expect(getFilteredEvents([], '', new Date('2025-05-20'), 'week')).toEqual([]);
  });
});
