import { Event } from '../entities/event/model/types';

export const sampleEvents: Event[] = [
  {
    id: '1',
    title: '팀 주간 미팅',
    date: '2024-03-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '이번 주 프로젝트 진행 상황 공유',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2024-06-20',
    },
    notificationTime: 10, // 10분 전 알림
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2024-03-20',
    startTime: '12:30',
    endTime: '13:30',
    description: '팀원들과 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 5, // 5분 전 알림
  },
  {
    id: '3',
    title: '월간 보고',
    date: '2024-03-21',
    startTime: '14:00',
    endTime: '15:00',
    description: '3월 실적 보고',
    location: '대회의실',
    category: '업무',
    repeat: {
      type: 'monthly',
      interval: 1,
      endDate: '2024-12-21',
    },
    notificationTime: 30, // 30분 전 알림
  },
  {
    id: '4',
    title: '일일 스탠드업',
    date: '2024-03-20',
    startTime: '09:00',
    endTime: '09:30',
    description: '일일 업무 공유',
    location: '온라인',
    category: '업무',
    repeat: {
      type: 'daily',
      interval: 1,
      endDate: '2024-03-31',
    },
    notificationTime: 5,
  },
  {
    id: '5',
    title: '생일 파티',
    date: '2024-03-01',
    startTime: '18:00',
    endTime: '20:00',
    description: '팀원 생일 축하 모임',
    location: '회사 근처 레스토랑',
    category: '개인',
    repeat: {
      type: 'yearly',
      interval: 1,
    },
    notificationTime: 60, // 1시간 전 알림
  },
];
