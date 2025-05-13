import type { EventCategory, RepeatType } from '../../types';

const TODAY = new Date().toISOString().split('T')[0];

/** 기본 이벤트 카테고리 */
export const EVENT_CATEGORIES: EventCategory[] = ['업무', '개인', '가족', '기타'] as const;

export const REPEAT_TYPES: RepeatType[] = ['none', 'daily', 'weekly', 'monthly', 'yearly'] as const;

export const EVENT = {
  title: '내가 만든 제목',
  date: TODAY,
  startTime: '00:00',
  endTime: '01:00',
  description: '내가 만든 설명',
  location: '내가 만든 위치',
  category: EVENT_CATEGORIES[0],
  notificationTime: 10,
  repeat: {
    type: REPEAT_TYPES[0],
    interval: 1,
    endDate: TODAY,
  },
};
