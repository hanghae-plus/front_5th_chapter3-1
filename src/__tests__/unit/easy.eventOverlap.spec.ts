import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('eventOverlap', () => {
  /**
   * @description 날짜와 시간을 Date 객체로 변환합니다.
   */
  describe('parseDateTime', () => {
    it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
      const date = '2025-07-01';
      const dateTime = '14:30';
      expect(parseDateTime(date, dateTime)).toEqual(new Date('2025-07-01T14:30:00'));
    });

    it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
      const date = 'invalid-date';
      const dateTime = '14:30';
      expect(parseDateTime(date, dateTime).toString()).toBe('Invalid Date');
    });

    it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
      const date = '2025-07-01';
      const dateTime = 'invalid-time';
      expect(parseDateTime(date, dateTime).toString()).toBe('Invalid Date');
    });

    it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
      const date = '';
      const dateTime = '14:30';
      expect(parseDateTime(date, dateTime).toString()).toBe('Invalid Date');
    });
  });

  describe('convertEventToDateRange', () => {
    it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
      const event: Event = {
        id: '1',
        title: '회의',
        date: '2025-07-01',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'none',
          interval: 1,
        },
        notificationTime: 30,
      };

      const result = convertEventToDateRange(event);
      expect(result.start).toEqual(new Date('2025-07-01T14:00:00'));
      expect(result.end).toEqual(new Date('2025-07-01T15:00:00'));
    });

    it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
      const event: Event = {
        id: '1',
        title: '회의',
        date: 'invalid-date',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'none',
          interval: 1,
        },
        notificationTime: 30,
      };

      const result = convertEventToDateRange(event);
      expect(result.start.toString()).toBe('Invalid Date');
      expect(result.end.toString()).toBe('Invalid Date');
    });

    it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
      const event: Event = {
        id: '1',
        title: '회의',
        date: '2025-07-01',
        startTime: 'invalid-time',
        endTime: '15:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'none',
          interval: 1,
        },
        notificationTime: 30,
      };

      const result = convertEventToDateRange(event);
      expect(result.start.toString()).toBe('Invalid Date');
      expect(result.end.toString()).not.toBe('Invalid Date');
    });
  });

  describe('isOverlapping', () => {
    let event1: Event;

    beforeEach(() => {
      event1 = {
        id: '1',
        title: '회의 1',
        description: '팀 회의 1',
        date: '2025-05-15',
        endTime: '11:00',
        startTime: '10:00',
        category: '회의',
        location: '회의실 1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 15,
      };
    });

    it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
      const event2: Event = {
        id: '2',
        title: '회의 2',
        description: '팀 회의 2',
        date: '2025-05-15',
        endTime: '11:30',
        startTime: '10:30',
        category: '회의',
        location: '회의실 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 15,
      };

      expect(isOverlapping(event1, event2)).toBe(true);
    });

    it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
      const event2: Event = {
        id: '2',
        title: '회의 B',
        date: '2025-07-01',
        startTime: '14:00',
        endTime: '16:00',
        description: '프로젝트 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: {
          type: 'none',
          interval: 1,
        },
        notificationTime: 30,
      };

      expect(isOverlapping(event1, event2)).toBe(false);
    });
  });

  describe('findOverlappingEvents', () => {
    let events: Event[];

    beforeEach(() => {
      events = [
        {
          id: '1',
          title: '회의 1',
          description: '팀 회의 1',
          date: '2025-05-15',
          endTime: '10:00',
          startTime: '09:00',
          category: '회의',
          location: '회의실 1',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 15,
        },
        {
          id: '2',
          title: '회의 2',
          description: '팀 회의 2',
          date: '2025-05-15',
          endTime: '11:00',
          startTime: '10:00',
          category: '회의',
          location: '회의실 2',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 15,
        },
        {
          id: '3',
          title: '회의 3',
          description: '팀 회의 3',
          date: '2025-05-15',
          endTime: '12:00',
          startTime: '11:00',
          category: '회의',
          location: '회의실 3',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 15,
        },
        {
          id: '4',
          title: '회의 4',
          description: '팀 회의 4',
          date: '2025-05-16',
          endTime: '11:00',
          startTime: '10:00',
          category: '회의',
          location: '회의실 4',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 15,
        },
      ];
    });

    it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
      const newEvent: Event = {
        id: '5',
        title: '새 회의',
        description: '새 팀 회의',
        date: '2025-05-15',
        endTime: '10:30',
        startTime: '09:30',
        category: '회의',
        location: '회의실',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 15,
      };

      expect(findOverlappingEvents(newEvent, events).map((event) => event.id)).toEqual(['1', '2']);
    });

    it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
      const newEvent: Event = {
        id: '3',
        title: '새 회의',
        date: '2025-07-01',
        startTime: '12:30',
        endTime: '13:30',
        description: '새 미팅',
        location: '회의실 C',
        category: '업무',
        repeat: {
          type: 'none',
          interval: 1,
        },
        notificationTime: 30,
      };

      expect(findOverlappingEvents(newEvent, events)).toEqual([]);
    });
  });
});
