import { describe, test, expect, beforeEach } from 'vitest';

import type { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('이벤트 유틸리티 함수', () => {
  describe('getUpcomingEvents', () => {
    let baseDate: Date;
    let events: Event[];

    beforeEach(() => {
      baseDate = new Date('2023-05-10T10:00:00');

      events = [
        {
          id: '1',
          title: '회의',
          date: '2023-05-10',
          startTime: '10:30:00',
          endTime: '11:30:00',
          description: '팀 미팅',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 30,
        },
        {
          id: '2',
          title: '점심 약속',
          date: '2023-05-10',
          startTime: '12:00:00',
          endTime: '13:00:00',
          description: '동료와 식사',
          location: '회사 근처 식당',
          category: '개인',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 60,
        },
        {
          id: '3',
          title: '미팅',
          date: '2023-05-10',
          startTime: '15:00:00',
          endTime: '16:00:00',
          description: '클라이언트 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 15,
        },
        {
          id: '4',
          title: '지난 일정',
          date: '2023-05-10',
          startTime: '09:00:00',
          endTime: '09:30:00',
          description: '아침 스크럼',
          location: '회의실 C',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        {
          id: '5',
          title: '먼 미래 일정',
          date: '2023-05-11',
          startTime: '10:00:00',
          endTime: '11:00:00',
          description: '다음날 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 30,
        },
      ];
    });

    test('알림 시간 내에 있는 이벤트만 반환해야 함', () => {
      const result = getUpcomingEvents(events, baseDate, []);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    test('현재 시간으로부터 notificationTime 분 내에 시작하는 이벤트만 반환해야 함', () => {
      const nearFutureDate = new Date('2023-05-10T14:50:00');
      const result = getUpcomingEvents(events, nearFutureDate, []);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    test('이미 알림이 전송된 이벤트는 제외해야 함', () => {
      const notifiedEvents = ['1'];
      const result = getUpcomingEvents(events, baseDate, notifiedEvents);

      expect(result).toHaveLength(0);
    });

    test('지난 이벤트는 반환하지 않아야 함', () => {
      const result = getUpcomingEvents(events, baseDate, []);

      expect(result.some((e) => e.id === '4')).toBe(false);
    });

    test('알림 시간을 초과한 이벤트는 반환하지 않아야 함', () => {
      const laterDate = new Date('2023-05-10T11:05:00');
      const result = getUpcomingEvents(events, laterDate, []);

      expect(result.some((e) => e.id === '1')).toBe(false);
    });

    test('빈 이벤트 배열이 주어지면 빈 배열을 반환해야 함', () => {
      const result = getUpcomingEvents([], baseDate, []);
      expect(result).toEqual([]);
    });
  });

  describe('createNotificationMessage', () => {
    test('올바른 알림 메시지를 생성해야 함', () => {
      const event: Event = {
        id: '1',
        title: '회의',
        date: '2023-05-10',
        startTime: '10:30:00',
        endTime: '11:30:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      };

      const message = createNotificationMessage(event);
      expect(message).toBe('30분 후 회의 일정이 시작됩니다.');
    });

    test('다른 이벤트에 대해서도 올바른 메시지를 생성해야 함', () => {
      const event: Event = {
        id: '2',
        title: '점심 약속',
        date: '2023-05-10',
        startTime: '12:00:00',
        endTime: '13:00:00',
        description: '동료와 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: { type: 'weekly', interval: 1, endDate: '2023-06-10' },
        notificationTime: 15,
      };

      const message = createNotificationMessage(event);
      expect(message).toBe('15분 후 점심 약속 일정이 시작됩니다.');
    });
  });
});
