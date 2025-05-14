import realEvents from '../../__mocks__/response/realEvents.json';
import type { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  it('알림 시간이 임박한 이벤트를 반환한다', () => {
    expect(
      getUpcomingEvents(realEvents.events as Event[], new Date('2025-05-20T09:59:59'), [])
    ).toEqual([
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '팀 회의',
        date: '2025-05-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    expect(
      getUpcomingEvents(realEvents.events as Event[], new Date('2025-05-10T17:00:00'), [
        '5b68ee07-97ec-4011-b18f-aedbb59607ba',
      ])
    ).toEqual([
      {
        id: 'cafaa525-f054-4aeb-8f16-4d22f19084f1',
        title: '일정2',
        date: '2025-05-10',
        startTime: '17:10',
        endTime: '18:10',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ]);
  });

  it('알림 시간이 아직 임박하지 않은 이벤트는 반환하지 않는다', () => {
    expect(
      getUpcomingEvents(realEvents.events as Event[], new Date('2025-05-22T15:00:00'), [
        '5b68ee07-97ec-4011-b18f-aedbb59607ba',
      ])
    ).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    expect(
      getUpcomingEvents(realEvents.events as Event[], new Date('2025-05-22T20:00:00'), [
        '5b68ee07-97ec-4011-b18f-aedbb59607ba',
      ])
    ).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    expect(createNotificationMessage(event)).toBe('1분 후 팀 회의 일정이 시작됩니다.');
  });
});
