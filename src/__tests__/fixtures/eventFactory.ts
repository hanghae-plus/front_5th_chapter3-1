import { Event, RepeatType } from '../../types';

const baseEvent: Event = {
  id: '0',
  title: '기본 이벤트',
  date: '2025-07-15',
  startTime: '09:00',
  endTime: '10:00',
  description: '',
  location: '',
  category: '',
  repeat: { type: 'none' as RepeatType, interval: 0 },
  notificationTime: 1,
};

export const createEvent = (overrides: Partial<Event> = {}): Event => {
  return {
    ...baseEvent,
    id: `event-${Math.random().toString(36).substring(2, 9)}`,
    ...overrides,
  };
};

const dateTestEvents: Event[] = [
  createEvent({
    id: '1',
    title: '이벤트1',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
  }),
  createEvent({
    id: '2',
    title: '이벤트2',
    date: '2025-07-02',
    startTime: '09:00',
    endTime: '10:00',
  }),
  createEvent({
    id: '3',
    title: '이벤트3',
    date: '2025-07-01',
    startTime: '11:00',
    endTime: '12:00',
  }),
];

const filterTestEvents: Event[] = [
  createEvent({
    id: '1',
    title: '이벤트 1',
    description: '첫 번째 미팅',
    location: '회의실 A',
    date: '2025-07-01',
  }),
  createEvent({
    id: '2',
    title: '이벤트 2',
    description: '두 번째 미팅',
    location: '회의실 B',
    date: '2025-07-03',
  }),
  createEvent({
    id: '3',
    title: '중요 회의',
    description: '이벤트 2 관련 회의',
    location: '대회의실',
    date: '2025-07-10',
  }),
  createEvent({
    id: '4',
    title: '월말 결산',
    description: '7월 결산',
    location: '재무부',
    date: '2025-07-30',
  }),
  createEvent({
    id: '5',
    title: '월초 계획',
    description: '8월 계획',
    location: '기획실',
    date: '2025-08-01',
  }),
  createEvent({
    id: '6',
    title: '연초 계획',
    description: '2025년 계획',
    location: '회의실 C',
    date: '2025-01-05',
  }),
];

const overlapTestEvents: Event[] = [
  createEvent({
    id: 'overlap-1',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '11:00',
    title: '겹침 테스트 1',
  }),
  createEvent({
    id: 'overlap-2',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '12:00',
    title: '겹침 테스트 2',
  }),
  createEvent({
    id: 'overlap-3',
    date: '2025-07-01',
    startTime: '12:00',
    endTime: '13:00',
    title: '겹침 없음 1',
  }),
];

const notificationTestEvents: Event[] = [
  createEvent({
    id: '1',
    title: '중요 회의',
    date: '2025-05-10',
    startTime: '14:00',
    endTime: '15:00',
    notificationTime: 30, // 30분 전 알림
  }),
  createEvent({
    id: '2',
    title: '점심 약속',
    date: '2025-05-10',
    startTime: '12:00',
    endTime: '13:00',
    notificationTime: 15, // 15분 전 알림
  }),
];

const integrationTestEvents: Event[] = [
  createEvent({
    id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
    title: '팀 회의',
    date: '2025-05-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
  }),
  createEvent({
    id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
    title: '점심 약속',
    date: '2025-05-21',
    startTime: '12:30',
    endTime: '13:30',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
  }),
  createEvent({
    id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
    title: '프로젝트 마감',
    date: '2025-05-25',
    startTime: '09:00',
    endTime: '18:00',
    description: '분기별 프로젝트 마감',
    location: '사무실',
    category: '업무',
  }),
  createEvent({
    id: 'dac62941-69e5-4ec0-98cc-24c2a79a7f81',
    title: '생일 파티',
    date: '2025-05-28',
    startTime: '19:00',
    endTime: '22:00',
    description: '친구 생일 축하',
    location: '친구 집',
    category: '개인',
  }),
  createEvent({
    id: '80d85368-b4a4-47b3-b959-25171d49371f',
    title: '운동',
    date: '2025-05-22',
    startTime: '18:00',
    endTime: '19:00',
    description: '주간 운동',
    location: '헬스장',
    category: '개인',
  }),
];

const testDatasets: Record<string, Event[]> = {
  date: dateTestEvents,
  filter: filterTestEvents,
  overlap: overlapTestEvents,
  notification: notificationTestEvents,
  integration: integrationTestEvents,
};

export const getTestEvents = (type: keyof typeof testDatasets): Event[] => testDatasets[type];
