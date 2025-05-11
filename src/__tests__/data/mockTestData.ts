import { Event } from '../../types';

export const mockTestDataList: Event[] = [
  {
    id: '1',
    date: '2025-05-01',
    title: 'Event A',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  } as Event,
  {
    id: '2',
    date: '2025-05-02',
    title: 'Event B',
    startTime: '11:00',
    endTime: '12:00',
    description: '새로운 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15,
  } as Event,
  {
    id: '3',
    date: '2025-05-03',
    title: 'Event C',
    startTime: '13:00',
    endTime: '14:00',
    description: '새로운 팀 미팅',
    location: '회의실 C',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 20,
  } as Event,
];

export const mockTestData: Event = {
  id: '1',
  date: '2025-05-01',
  title: 'Event A',
  startTime: '09:00',
  endTime: '10:00',
  description: '기존 팀 미팅',
  location: '회의실 B',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};
