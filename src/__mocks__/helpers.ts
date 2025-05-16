import { Event } from '../types';

export const isExistingEvent = (events: Event[], id: string) =>
  !!events.find((event) => event.id === id);

export const generateEventId = () => String(new Date().getTime());

/**
 * 오늘 날짜를 기준으로 테스트 이벤트를 생성합니다.
 */
export const createTodayEvent = (overrides?: Partial<Event>): Event => {
  const today = new Date();
  const todayStr = getDateString(today);

  // 기본 이벤트 속성
  const defaultEvent: Event = {
    id: generateEventId(),
    title: '테스트 일정',
    date: todayStr,
    startTime: '14:00',
    endTime: '15:00',
    description: '테스트 설명',
    location: '테스트 장소',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  return { ...defaultEvent, ...overrides };
};

export const getDateString = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
};
