import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    // 데이터 설정
    const now = new Date('2023-05-15T14:00:00');
    const events: Event[] = [
      {
        id: '1',
        title: '회의',
        date: '2023-05-15',
        startTime: '14:30:00',
        endTime: '15:30:00',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30, // 30분 전 알림
      },
    ];
    const notifiedEvents: string[] = [];

    // 실행
    const result = getUpcomingEvents(events, now, notifiedEvents);

    // 검증
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    // 데이터 설정
    const now = new Date('2023-05-15T14:00:00');
    const events: Event[] = [
      {
        id: '1',
        title: '회의',
        date: '2023-05-15',
        startTime: '14:30:00',
        endTime: '15:30:00',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30, // 30분 전 알림
      },
      {
        id: '2',
        title: '점심식사',
        date: '2023-05-15',
        startTime: '12:30:00',
        endTime: '13:30:00',
        description: '팀 점심식사',
        location: '식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 15, // 15분 전 알림
      },
    ];
    const notifiedEvents: string[] = ['1']; // 이미 알림이 간 이벤트

    // 실행
    const result = getUpcomingEvents(events, now, notifiedEvents);

    // 검증
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    // 데이터 설정
    const now = new Date('2023-05-15T14:00:00');
    const events: Event[] = [
      {
        id: '1',
        title: '회의',
        date: '2023-05-15',
        startTime: '15:00:00',
        endTime: '16:00:00',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30, // 30분 전 알림
      },
    ];
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    // 데이터 설정
    const now = new Date('2023-05-15T14:00:00');
    const events: Event[] = [
      {
        id: '1',
        title: '회의',
        date: '2023-05-15',
        startTime: '14:05:00',
        endTime: '15:00:00',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10, // 10분 전 알림 (14:05 - 0:10 = 13:55, 현재 14:00이므로 이미 알림 시간이 지남)
      },
    ];
    const notifiedEvents: string[] = ['1']; // 이미 알림이 간 이벤트로 설정

    // 실행
    const result = getUpcomingEvents(events, now, notifiedEvents);

    // 검증
    expect(result).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    // 데이터 설정
    const event: Event = {
      id: '1',
      title: '회의',
      date: '2023-05-15',
      startTime: '14:30:00',
      endTime: '15:30:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30, // 30분 전 알림
    };

    // 실행
    const message = createNotificationMessage(event);

    // 검증
    expect(message).toBe('30분 후 회의 일정이 시작됩니다.');
  });
});
