import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = '2025-07-01';
    const time = '14:30';

    const result = parseDateTime(date, time);

    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-200';
    const time = '14:30';

    const result = parseDateTime(date, time);

    expect(result).instanceOf(Date);
    expect(result.getTime()).toBeNaN();
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-01';
    const time = '25:30';

    const result = parseDateTime(date, time);

    expect(result).instanceOf(Date);
    expect(result.getTime()).toBeNaN();
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = '';
    const time = '14:30';

    const result = parseDateTime(date, time);

    expect(result).instanceOf(Date);
    expect(result.getTime()).toBeNaN();
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      description: '테스트 이벤트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 0,
    };

    const result = convertEventToDateRange(event);

    // QUESTION: 유닛 테스트에서 다른 함수를 불러서 테스트하는게 옳은 방법인지?
    expect(result).toEqual({
      start: parseDateTime(event.date, event.startTime),
      end: parseDateTime(event.date, event.endTime),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-07-200',
      startTime: '14:30',
      endTime: '15:30',
      description: '테스트 이벤트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 0,
    };

    const result = convertEventToDateRange(event);

    expect(result.start).toBeInstanceOf(Date);
    expect(result.start.getTime()).toBeNaN();
    expect(result.end).toBeInstanceOf(Date);
    expect(result.end.getTime()).toBeNaN();
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-07-01',
      startTime: '25:30',
      endTime: '30:30',
      description: '테스트 이벤트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 0,
    };

    const result = convertEventToDateRange(event);

    expect(result.start).toBeInstanceOf(Date);
    expect(result.start.getTime()).toBeNaN();
    expect(result.end).toBeInstanceOf(Date);
    expect(result.end.getTime()).toBeNaN();
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {});

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {});
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {});

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {});
});
