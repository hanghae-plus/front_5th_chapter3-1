import { describe, it, expect } from 'vitest';

import { getUpcomingEvents } from '../../features/event-operations/lib/notificationUtils';

describe('getUpcomingEvents', () => {
  const baseNow = new Date('2025-07-01T09:00');

  it('알림 시간 내의 이벤트만 반환해야 한다', () => {
    const events = [
      {
        id: '1',
        title: '회의',
        date: '2025-07-01',
        startTime: '09:10',
        endTime: '10:00',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' },
        notificationTime: 15,
      },
      {
        id: '2',
        title: '점심약속',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '점심 식사',
        location: '식당',
        category: '개인',
        repeat: 'none',
        notificationTime: 30,
      },
      {
        id: '3',
        title: '이미 시작된 일정',
        date: '2025-07-01',
        startTime: '08:50',
        endTime: '09:30',
        description: '프로젝트 논의',
        location: '회의실 B',
        category: '업무',
        repeat: 'none',
        notificationTime: 20,
      },
    ];

    const result = getUpcomingEvents(events, baseNow, []);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('1');
  });

  it('이미 알림을 보낸 이벤트는 제외해야 한다', () => {
    const events = [
      {
        id: '1',
        title: '회의',
        date: '2025-07-01',
        startTime: '09:10',
        notificationTime: 15,
      },
    ];

    const result = getUpcomingEvents(events, baseNow, ['1']);
    expect(result).toEqual([]);
  });

  it('알림 시간이 0분이면 어떤 일정도 포함되지 않아야 한다', () => {
    const events = [
      {
        id: '1',
        title: '회의',
        date: '2025-07-01',
        startTime: '09:10',
        notificationTime: 0,
      },
    ];

    const result = getUpcomingEvents(events, baseNow, []);
    expect(result).toEqual([]);
  });

  it('알림 시간이 지나지 않은 미래 이벤트는 포함되지 않아야 한다', () => {
    const events = [
      {
        id: '1',
        title: '미래회의',
        date: '2025-07-01',
        startTime: '10:30',
        notificationTime: 15,
      },
    ];

    const result = getUpcomingEvents(events, baseNow, []);
    expect(result).toEqual([]);
  });
});
