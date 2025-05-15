import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '점심 약속',
        date: '2025-07-01',
        startTime: '12:30',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '3',
        title: '운동',
        date: '2025-07-01',
        startTime: '18:00',
        endTime: '19:00',
        description: '헬스장 방문',
        location: '피트니스 센터',
        category: '건강',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const currentDate = new Date('2025-07-01T17:59');

    const upcomingEvents = getUpcomingEvents(events, currentDate, []);

    expect(upcomingEvents).toEqual([events[2]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '점심 약속',
        date: '2025-07-01',
        startTime: '12:30',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const currentDate = new Date('2025-07-01T12:29');

    const upcomingEvents = getUpcomingEvents(events, currentDate, ['1']);

    expect(upcomingEvents).toEqual([events[1]]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '점심 약속',
        date: '2025-07-01',
        startTime: '12:30',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const currentDate = new Date('2025-06-30T13:31');

    const upcomingEvents = getUpcomingEvents(events, currentDate, []);

    expect(upcomingEvents).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '점심 약속',
        date: '2025-07-01',
        startTime: '12:30',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const currentDate = new Date('2025-07-01T12:29');

    const upcomingEvents = getUpcomingEvents(events, currentDate, []);

    expect(upcomingEvents).toEqual([events[1]]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 회의',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:30',
      description: '테스트 회의 설명',
      location: '항해 젭 12팀 회의실',
      category: '테스트코드',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const message = createNotificationMessage(event);

    expect(message).toBe('30분 후 테스트 회의 일정이 시작됩니다.');
  });
});
