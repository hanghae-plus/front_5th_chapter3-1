import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const events: Event[] = [
  {
    id: "2b7545a6-ebee-282c-203a-2329bc8d62bd",
    title: "월간 회의",
    date: "2025-05-01",
    startTime: "10:00",
    endTime: "11:00",
    description: "월간 팀 미팅",
    location: "회의실 A",
    category: "업무",
    repeat: { type: "none", interval: 0 },
    notificationTime: 1,
  },
  {
    id: "2b7545a6-ebee-426c-b906-2329bc8d62bd",
    title: "팀 회의",
    date: "2025-05-20",
    startTime: "10:00",
    endTime: "11:00",
    description: "주간 팀 미팅",
    location: "회의실 A",
    category: "업무",
    repeat: { type: "none", interval: 0 },
    notificationTime: 1,
  }
]

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    expect(getUpcomingEvents(events, new Date("2025-05-20 09:59"), ["팀 회의"])).toEqual([{
      id: "2b7545a6-ebee-426c-b906-2329bc8d62bd",
      title: "팀 회의",
      date: "2025-05-20",
      startTime: "10:00",
      endTime: "11:00",
      description: "주간 팀 미팅",
      location: "회의실 A",
      category: "업무",
      repeat: { type: "none", interval: 0 },
      notificationTime: 1,
    }])
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    expect(getUpcomingEvents(events, new Date("2025-05-20 10:00"), ["팀 회의"])).toEqual([])
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(events, new Date("2025-05-20 09:01"), ["팀 회의"])).toEqual([])
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(events, new Date("2025-05-20 10:10"), ["팀 회의"])).toEqual([])
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    expect(createNotificationMessage(events[0])).toBe('1분 후 월간 회의 일정이 시작됩니다.');
  });
});
