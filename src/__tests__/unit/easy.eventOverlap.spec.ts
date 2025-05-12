import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

/**
 * @description parseDateTime -> 주어진 날짜와 시간을 Date 객체로 변환합니다. (parseDateTime)
 */
describe('주어진 날짜와 시간을 Date 객체로 변환합니다. (parseDateTime)', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');

    expect(result).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-32', '14:30');

    expect(result).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '25:30');

    expect(result).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');

    expect(result).toEqual(new Date('Invalid Date'));
  });

  /**
   * @description (추가) 시간 문자열이 비어있을 때도 체크
   */
  it('시간 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '');

    expect(result).toEqual(new Date('Invalid Date'));
  });

  /**
   * @description (추가) 날짜 문자열이 비어있고 시간 문자열이 비어있을 때도 체크
   */
  it('날짜 문자열이 비어있고 시간 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '');

    expect(result).toEqual(new Date('Invalid Date'));
  });
});

/**
 * @description convertEventToDateRange -> 이벤트 객체를 시작 및 종료 시간을 가진 객체로 변환합니다. (convertEventToDateRange)
 */
describe('이벤트 객체를 시작 및 종료 시간을 가진 객체로 변환합니다. (convertEventToDateRange)', () => {
  let mockEventForm: Event;

  beforeEach(() => {
    mockEventForm = {
      id: '1',
      title: '이벤트 1',
      description: '이벤트 1 설명',
      location: '이벤트 1 위치',
      category: '이벤트 1 카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
      date: '2025-05-12',
      startTime: '14:30',
      endTime: '15:30',
    };
  });
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(mockEventForm);

    expect(result).toEqual({
      start: new Date('2025-05-12T14:30:00'),
      end: new Date('2025-05-12T15:30:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange({
      ...mockEventForm,
      date: '2025-05-32',
    });

    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange({
      ...mockEventForm,
      startTime: '25:30',
      endTime: '26:30',
    });

    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  // 날짜, 시작시간, 종료시간이 모두 비어있는 경우도 체크할까 했는데 타입 자체가 EVENT고 다 필수 값들이 있을때만 파라미터를 넘기므로 할 필요 없다고 판단하여 테스트 작성 안함
});

/**
 * @description isOverlapping -> 두 이벤트가 겹치는지 확인합니다. (isOverlapping)
 */
describe('두 이벤트가 겹치는지 확인합니다. (isOverlapping)', () => {
  let mockEventForm: Event;

  beforeEach(() => {
    mockEventForm = {
      id: '1',
      title: '이벤트 1',
      description: '이벤트 1 설명',
      location: '이벤트 1 위치',
      category: '이벤트 1 카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
      date: '2025-05-12',
      startTime: '14:30',
      endTime: '15:30',
    };
  });
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const result = isOverlapping(mockEventForm, {
      ...mockEventForm,
      startTime: '14:20',
      endTime: '16:00',
    });

    expect(result).toBeTruthy();
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const result = isOverlapping(mockEventForm, {
      ...mockEventForm,
      startTime: '15:30',
      endTime: '16:30',
    });

    expect(result).toBeFalsy();
  });
});

/**
 * @description findOverlappingEvents -> 새 이벤트와 겹치는 모든 이벤트를 반환합니다. (findOverlappingEvents)
 */
describe('새 이벤트와 겹치는 모든 이벤트를 반환합니다. (findOverlappingEvents)', () => {
  let mockEvents: Event[];

  beforeEach(() => {
    mockEvents = [
      {
        id: '1',
        title: '이벤트 1',
        description: '이벤트 1 설명',
        location: '이벤트 1 위치',
        category: '이벤트 1 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
        date: '2025-05-12',
        startTime: '14:30',
        endTime: '15:30',
      },
      {
        id: '2',
        title: '이벤트 2',
        description: '이벤트 2 설명',
        location: '이벤트 2 위치',
        category: '이벤트 2 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
        date: '2025-05-12',
        startTime: '16:00',
        endTime: '17:00',
      },
    ];
  });

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const result = findOverlappingEvents(
      {
        ...mockEvents[0],
        id: '3',
        startTime: '14:20',
        endTime: '15:50',
      },
      mockEvents
    );

    expect(result).toEqual([mockEvents[0]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const result = findOverlappingEvents(
      {
        ...mockEvents[0],
        startTime: '12:00',
        endTime: '14:00',
      },
      mockEvents
    );

    expect(result).toEqual([]);
  });
});
